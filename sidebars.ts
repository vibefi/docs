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
      label: 'Components',
      items: [
        'components/contracts',
        'components/cli',
        'components/client',
        'components/e2e',
        'components/dapp-examples',
        'components/studio',
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
        'reference/commands',
        'reference/source-audit',
      ],
    },
  ],
};

export default sidebars;
