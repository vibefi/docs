---
title: Sepolia Token Seller
---

import SepoliaTokenBuyer from '@site/src/components/SepoliaTokenBuyer';

The Sepolia token seller is a fixed-price contract that accepts Sepolia ETH and transfers VibeFi testnet tokens (`VFI`) to buyers.

This replaces a faucet-style flow with a simple on-chain buy flow.

## Browser Buy (wallet)

Use this if you want to connect a wallet and buy without running Foundry commands.

<SepoliaTokenBuyer />

## Addresses

Set these first:

```bash
export SEPOLIA_RPC_URL="<your-rpc-url>"
export VFI_TOKEN_ADDRESS="0xD11496882E083Ce67653eC655d14487030E548aC"
export TOKEN_SELLER_ADDRESS="0x93bb81a54d9Dd29b8e8037260aF93770c4F2A64E"
```

## Buyer Flow (cast)

Set your wallet key:

```bash
export BUYER_PK="<private-key>"
export BUYER_ADDRESS=$(cast wallet address --private-key "$BUYER_PK")
```

Check pricing:

```bash
cast call $TOKEN_SELLER_ADDRESS "tokensPerEth()(uint256)" --rpc-url $SEPOLIA_RPC_URL
```

Quote how many tokens you get for `0.01 ETH`:

```bash
ETH_IN_WEI=$(cast to-wei 0.01 ether)
MIN_TOKENS_OUT=$(cast call $TOKEN_SELLER_ADDRESS "quoteTokenAmount(uint256)(uint256)" $ETH_IN_WEI --rpc-url $SEPOLIA_RPC_URL)
echo $MIN_TOKENS_OUT
```

Buy tokens:

```bash
cast send $TOKEN_SELLER_ADDRESS \
  "buy(address,uint256)" \
  $BUYER_ADDRESS \
  $MIN_TOKENS_OUT \
  --value 0.01ether \
  --private-key $BUYER_PK \
  --rpc-url $SEPOLIA_RPC_URL
```

Check your VFI balance:

```bash
cast call $VFI_TOKEN_ADDRESS "balanceOf(address)(uint256)" $BUYER_ADDRESS --rpc-url $SEPOLIA_RPC_URL
```

## Owner Flow (fund + admin)

Set your owner/deployer key:

```bash
export OWNER_ADDRESS=$(cast wallet address --mnemonic "$SEPOLIA_MNEMONIC")
export OWNER_PK=$(cast wallet private-key --mnemonic "$SEPOLIA_MNEMONIC")
```

Deploy a token seller:

```bash
cd contracts
export VFI_TOKEN_ADDRESS="<vfi-token-address>"
export SELLER_OWNER=$OWNER_ADDRESS

FOUNDRY_PROFILE=ci forge script script/DeployTokenSeller.s.sol:DeployTokenSeller \
  --rpc-url $SEPOLIA_RPC_URL \
  --broadcast -vvv
```

This script deploys with `10 VFI` per `1 ETH` and transfers `10,000 VFI` from the deployer into seller inventory.

Fund seller inventory:

```bash
cast send $VFI_TOKEN_ADDRESS \
  "transfer(address,uint256)" \
  $TOKEN_SELLER_ADDRESS \
  $(cast to-wei 100000 ether) \
  --private-key $OWNER_PK \
  --rpc-url $SEPOLIA_RPC_URL
```

Update pricing:

```bash
cast send $TOKEN_SELLER_ADDRESS \
  "setTokensPerEth(uint256)" \
  $(cast to-wei 750 ether) \
  --private-key $OWNER_PK \
  --rpc-url $SEPOLIA_RPC_URL
```

Check unsold inventory and ETH collected:

```bash
cast call $TOKEN_SELLER_ADDRESS "tokensAvailable()(uint256)" --rpc-url $SEPOLIA_RPC_URL
cast balance $TOKEN_SELLER_ADDRESS --rpc-url $SEPOLIA_RPC_URL
```

Withdraw collected ETH:

```bash
cast send $TOKEN_SELLER_ADDRESS \
  "withdrawEth(address,uint256)" \
  $OWNER_ADDRESS \
  $(cast to-wei 0.1 ether) \
  --private-key $OWNER_PK \
  --rpc-url $SEPOLIA_RPC_URL
```

Withdraw unsold tokens:

```bash
cast send $TOKEN_SELLER_ADDRESS \
  "withdrawUnsoldTokens(address,uint256)" \
  $OWNER_ADDRESS \
  $(cast to-wei 5000 ether) \
  --private-key $OWNER_PK \
  --rpc-url $SEPOLIA_RPC_URL
```

## Getting Sepolia ETH

If you do not have enough Sepolia ETH to buy VFI testnet tokens, use testnetbridge to get ETH first.

If you do not want to do that, ask in the Telegram group and we can help directly.
