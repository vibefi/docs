import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/prerequisites',
        'getting-started/local-stack',
        'getting-started/sepolia-testnet-faucet',
        'getting-started/contributing',
      ],
    },
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'architecture/overview',
      ],
    },
    {
      type: 'category',
      label: 'Protocol',
      items: [
        'protocol/overview',
        'protocol/network-actors',
        'protocol/vfi',
        'protocol/dao',
      ],
    },
    {
      type: 'category',
      label: 'Components',
      items: [
        'components/contracts',
        'components/cli',
        'components/gov-agent',
        'components/client',
        'components/packages',
        'components/e2e',
        'components/dapp-examples',
        'components/studio',
        'components/ipfs-relay',
        'components/lander',
        'components/docs',
      ],
    },
    {
      type: 'category',
      label: 'Workflows',
      items: [
        'workflows/governance-lifecycle',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'reference/contract-addresses',
        'reference/commands',
        'reference/ipc-protocol',
        'reference/manifest-schema'
      ],
    },
  ],
};

export default sidebars;
