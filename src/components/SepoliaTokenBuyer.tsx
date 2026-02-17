import BrowserOnly from '@docusaurus/BrowserOnly';
import React, {useCallback, useEffect, useMemo, useState} from 'react';

const SEPOLIA_CHAIN_ID = 11155111;
const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7';
const TOKEN_SELLER_ADDRESS = '0x93bb81a54d9Dd29b8e8037260aF93770c4F2A64E';

const QUOTE_SELECTOR = '0xd83e4515';
const BUY_SELECTOR = '0xcce7ec13';
const TOKENS_PER_ETH_SELECTOR = '0xcbdd69b5';

type Eip1193Provider = {
  request: (args: {method: string; params?: unknown[]}) => Promise<unknown>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

function normalizeHex(value: string): string {
  return value.startsWith('0x') ? value.slice(2) : value;
}

function padToWord(hexWithoutPrefix: string): string {
  return hexWithoutPrefix.padStart(64, '0');
}

function encodeUint256(value: bigint): string {
  return padToWord(value.toString(16));
}

function encodeAddress(address: string): string {
  return padToWord(normalizeHex(address).toLowerCase());
}

function toRpcHex(value: bigint): string {
  return `0x${value.toString(16)}`;
}

function bigintFromRpcHex(value: unknown): bigint {
  if (typeof value !== 'string' || value.length === 0 || value === '0x') {
    return 0n;
  }
  return BigInt(value);
}

function parseEthToWei(value: string): bigint {
  const trimmed = value.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error('Enter a valid ETH amount (example: 0.01)');
  }

  const [whole, fraction = ''] = trimmed.split('.');
  if (fraction.length > 18) {
    throw new Error('Use at most 18 decimal places');
  }

  const wholeWei = BigInt(whole) * 10n ** 18n;
  const fractionWei = BigInt((fraction + '0'.repeat(18)).slice(0, 18));
  return wholeWei + fractionWei;
}

function formatUnits(value: bigint, decimals: number, precision = 4): string {
  const base = 10n ** BigInt(decimals);
  const whole = value / base;
  const fraction = value % base;
  if (fraction === 0n) {
    return whole.toString();
  }

  const padded = fraction.toString().padStart(decimals, '0').slice(0, precision);
  const trimmed = padded.replace(/0+$/, '');
  return trimmed ? `${whole.toString()}.${trimmed}` : whole.toString();
}

type WalletState = {
  account: string;
  chainId: number | null;
};

function SepoliaTokenBuyerInner(): React.JSX.Element {
  const [ethAmount, setEthAmount] = useState('0.01');
  const [wallet, setWallet] = useState<WalletState>({account: '', chainId: null});
  const [status, setStatus] = useState('Connect your wallet to buy VFI from this page.');
  const [quote, setQuote] = useState<bigint | null>(null);
  const [tokensPerEth, setTokensPerEth] = useState<bigint | null>(null);
  const [txHash, setTxHash] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [autoSwitchAttempted, setAutoSwitchAttempted] = useState(false);

  const provider = useMemo(() => window.ethereum, []);
  const isConnected = wallet.account.length > 0;
  const onSepolia = wallet.chainId === SEPOLIA_CHAIN_ID;
  const wrongNetwork = wallet.chainId !== null && wallet.chainId !== SEPOLIA_CHAIN_ID;
  const canSubmit = isConnected && onSepolia && !isBusy;

  const refreshWallet = useCallback(async (): Promise<WalletState> => {
    if (!provider) {
      return {account: '', chainId: null};
    }

    const [accountsResponse, chainIdResponse] = await Promise.all([
      provider.request({method: 'eth_accounts'}),
      provider.request({method: 'eth_chainId'}),
    ]);

    const accounts = Array.isArray(accountsResponse) ? (accountsResponse as string[]) : [];
    const chainIdHex = typeof chainIdResponse === 'string' ? chainIdResponse : '0x0';
    const chainId = Number(BigInt(chainIdHex));

    const nextWallet = {
      account: accounts[0] ?? '',
      chainId,
    };
    setWallet(nextWallet);
    return nextWallet;
  }, [provider]);

  useEffect(() => {
    if (!provider) {
      setStatus('No injected wallet found. Install MetaMask or another EIP-1193 wallet.');
      return;
    }

    void (async () => {
      try {
        const nextWallet = await refreshWallet();
        if (nextWallet.account && nextWallet.chainId === SEPOLIA_CHAIN_ID) {
          setStatus('Wallet auto-connected on Sepolia.');
        } else if (nextWallet.account) {
          setStatus('Wallet detected. Switching to Sepolia...');
        }
      } catch {
        setStatus('Could not read wallet state.');
      }
    })();

    const onAccountsChanged = (accounts: unknown) => {
      const nextAccount = Array.isArray(accounts) ? (accounts[0] as string) ?? '' : '';
      setWallet((prev) => ({...prev, account: nextAccount}));
      setAutoSwitchAttempted(false);
      setQuote(null);
      setTxHash('');
    };

    const onChainChanged = (chainIdHex: unknown) => {
      const parsed = typeof chainIdHex === 'string' ? Number(BigInt(chainIdHex)) : null;
      setWallet((prev) => ({...prev, chainId: parsed}));
      setAutoSwitchAttempted(false);
      setQuote(null);
      setTxHash('');
    };

    provider.on?.('accountsChanged', onAccountsChanged);
    provider.on?.('chainChanged', onChainChanged);

    return () => {
      provider.removeListener?.('accountsChanged', onAccountsChanged);
      provider.removeListener?.('chainChanged', onChainChanged);
    };
  }, [provider, refreshWallet]);

  const connectWallet = useCallback(async () => {
    if (!provider) {
      setStatus('No injected wallet found. Install MetaMask or another EIP-1193 wallet.');
      return;
    }

    setIsBusy(true);
    setStatus('Connecting wallet...');
    try {
      await provider.request({method: 'eth_requestAccounts'});
      await refreshWallet();
      setStatus('Wallet connected.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Connection was rejected.';
      setStatus(`Failed to connect wallet: ${message}`);
    } finally {
      setIsBusy(false);
    }
  }, [provider, refreshWallet]);

  const switchToSepolia = useCallback(async (auto = false) => {
    if (!provider) {
      setStatus('No injected wallet found.');
      return;
    }

    setIsBusy(true);
    setStatus(auto ? 'Wallet detected. Switching to Sepolia...' : 'Switching network to Sepolia...');
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{chainId: SEPOLIA_CHAIN_ID_HEX}],
      });
      await refreshWallet();
      setStatus('Connected to Sepolia.');
    } catch (error) {
      const err = error as {code?: number; message?: string};
      if (err.code === 4902) {
        setStatus('Sepolia is not configured in this wallet yet. Add it, then try again.');
      } else if (auto && err.code === 4001) {
        setStatus('Wallet is connected on a different network. Switch to Sepolia to continue.');
      } else {
        setStatus(`Failed to switch network: ${err.message ?? 'Unknown error'}`);
      }
    } finally {
      setIsBusy(false);
    }
  }, [provider, refreshWallet]);

  useEffect(() => {
    if (!provider || !isConnected || onSepolia || isBusy || autoSwitchAttempted) {
      return;
    }
    setAutoSwitchAttempted(true);
    void switchToSepolia(true);
  }, [autoSwitchAttempted, isBusy, isConnected, onSepolia, provider, switchToSepolia]);

  const quoteTokenAmount = useCallback(async (): Promise<bigint> => {
    if (!provider) {
      throw new Error('No wallet provider detected');
    }

    const weiIn = parseEthToWei(ethAmount);
    if (weiIn <= 0n) {
      throw new Error('ETH amount must be greater than zero');
    }

    const quoteCallData = `${QUOTE_SELECTOR}${encodeUint256(weiIn)}`;

    const [quoteResult, priceResult] = await Promise.all([
      provider.request({
        method: 'eth_call',
        params: [{to: TOKEN_SELLER_ADDRESS, data: quoteCallData}, 'latest'],
      }),
      provider.request({
        method: 'eth_call',
        params: [{to: TOKEN_SELLER_ADDRESS, data: TOKENS_PER_ETH_SELECTOR}, 'latest'],
      }),
    ]);

    const quotedTokens = bigintFromRpcHex(quoteResult);
    const tokensPerOneEth = bigintFromRpcHex(priceResult);

    setQuote(quotedTokens);
    setTokensPerEth(tokensPerOneEth);
    return quotedTokens;
  }, [ethAmount, provider]);

  const refreshQuote = useCallback(async (updateStatus: boolean) => {
    if (!provider || !onSepolia) {
      return;
    }
    try {
      const quotedTokens = await quoteTokenAmount();
      if (updateStatus) {
        setStatus(`Quote ready: ${formatUnits(quotedTokens, 18)} VFI`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch quote';
      setStatus(message);
      setQuote(null);
      setTokensPerEth(null);
    }
  }, [onSepolia, provider, quoteTokenAmount]);

  useEffect(() => {
    if (!provider || !onSepolia || isBusy) {
      return;
    }
    const timer = window.setTimeout(() => {
      void refreshQuote(false);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [ethAmount, isBusy, onSepolia, provider, refreshQuote]);

  const buyTokens = useCallback(async () => {
    if (!provider || !wallet.account) {
      setStatus('Connect your wallet first.');
      return;
    }
    if (!onSepolia) {
      setStatus('Switch to Sepolia before buying.');
      return;
    }

    setIsBusy(true);
    setStatus('Preparing transaction...');
    setTxHash('');

    try {
      const weiIn = parseEthToWei(ethAmount);
      if (weiIn <= 0n) {
        throw new Error('ETH amount must be greater than zero');
      }

      const minTokensOut = await quoteTokenAmount();
      if (minTokensOut <= 0n) {
        throw new Error('Quote returned zero tokens');
      }

      const txData = `${BUY_SELECTOR}${encodeAddress(wallet.account)}${encodeUint256(minTokensOut)}`;
      const txHashResponse = await provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: wallet.account,
            to: TOKEN_SELLER_ADDRESS,
            value: toRpcHex(weiIn),
            data: txData,
          },
        ],
      });

      const hash = typeof txHashResponse === 'string' ? txHashResponse : '';
      setTxHash(hash);
      setStatus('Transaction sent. Confirmed tokens will appear after mining.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Transaction failed';
      setStatus(`Buy failed: ${message}`);
    } finally {
      setIsBusy(false);
    }
  }, [ethAmount, onSepolia, provider, quoteTokenAmount, wallet.account]);

  const amountBoxStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid var(--ifm-color-emphasis-300)',
    borderRadius: 4,
    padding: '8px 10px',
    height: 38,
    boxSizing: 'border-box',
    background: 'var(--ifm-background-surface-color)',
    color: 'var(--ifm-font-color-base)',
    fontFamily: 'inherit',
    fontSize: '1rem',
    lineHeight: '22px',
  };

  return (
    <div style={{border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: 10, padding: 16, marginBottom: 20}}>
      <p style={{marginTop: 0}}>
        Buy VFI directly with your browser wallet. This calls the same <code>buy(address,uint256)</code> function from
        the contract in this guide.
      </p>

      <p style={{margin: '4px 0 10px 0'}}>
        <strong>Token Seller:</strong> <code>{TOKEN_SELLER_ADDRESS}</code>
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div>
          <label style={{display: 'block', fontWeight: 600, marginBottom: 4}} htmlFor="eth-amount">
            ETH Amount
          </label>
          <input
            id="eth-amount"
            type="text"
            value={ethAmount}
            onChange={(event) => setEthAmount(event.target.value)}
            placeholder="0.01"
            style={{
              ...amountBoxStyle,
              appearance: 'none',
              WebkitAppearance: 'none',
            }}
          />
        </div>
        <div>
          <label style={{display: 'block', fontWeight: 600, marginBottom: 4}} htmlFor="vfi-amount-out">
            Receive VFI
          </label>
          <div
            id="vfi-amount-out"
            style={{
              ...amountBoxStyle,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {quote !== null ? `${formatUnits(quote, 18)} VFI` : 'Enter amount on Sepolia'}
          </div>
        </div>
      </div>

      <div style={{display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12}}>
        <button
          type="button"
          className="button vf-gradient-button"
          onClick={buyTokens}
          disabled={!canSubmit}
          style={{minWidth: 124}}
        >
          Buy VFI
        </button>
      </div>

      <p style={{margin: '4px 0'}}>
        <strong>Wallet:</strong> {wallet.account || 'Not connected'}
      </p>
      <p style={{margin: '4px 0'}}>
        <strong>Network:</strong>{' '}
        {wallet.chainId === null ? 'Unknown' : wallet.chainId === SEPOLIA_CHAIN_ID ? 'Sepolia' : `Chain ${wallet.chainId}`}
      </p>
      {tokensPerEth !== null ? (
        <p style={{margin: '4px 0'}}>
          <strong>Price:</strong> {formatUnits(tokensPerEth, 18)} VFI per ETH
        </p>
      ) : null}
      {txHash ? (
        <p style={{margin: '4px 0'}}>
          <strong>Tx:</strong>{' '}
          <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer">
            {txHash}
          </a>
        </p>
      ) : null}
      {wrongNetwork ? <p style={{color: 'var(--ifm-color-danger)', marginBottom: 0}}>Wallet is not on Sepolia.</p> : null}
      <p style={{marginBottom: 0}}>
        <strong>Status:</strong> {status}
      </p>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12}}>
        <button
          type="button"
          className="button vf-utility-button"
          onClick={connectWallet}
          disabled={isBusy || !provider}
        >
          {isConnected ? 'Reconnect Wallet' : 'Connect Wallet'}
        </button>
        <button
          type="button"
          className="button vf-utility-button"
          onClick={() => void switchToSepolia()}
          disabled={isBusy || !isConnected || !provider}
        >
          Switch to Sepolia
        </button>
      </div>
    </div>
  );
}

export default function SepoliaTokenBuyer(): React.JSX.Element {
  return (
    <BrowserOnly fallback={<p>This interactive buyer requires a browser wallet (for example MetaMask).</p>}>
      {() => <SepoliaTokenBuyerInner />}
    </BrowserOnly>
  );
}
