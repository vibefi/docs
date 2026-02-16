import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'VibeFi Docs',
  tagline: 'Decentralized governance and hosting for DeFi frontends',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  url: 'https://docs.vibefi.workers.dev',
  baseUrl: '/',

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/vibefi/docs/tree/master/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'VibeFi',
      logo: {
        alt: 'VibeFi Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/vibefi/monorepo',
          label: 'Monorepo',
          position: 'right',
        },
        {
          href: 'https://github.com/vibefi/docs',
          label: 'Docs Repo',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/getting-started/prerequisites',
            },
            {
              label: 'Governance Workflow',
              to: '/docs/workflows/governance-lifecycle',
            },
          ],
        },
        {
          title: 'Repos',
          items: [
            {
              label: 'Monorepo',
              href: 'https://github.com/vibefi/monorepo',
            },
            {
              label: 'Docs',
              href: 'https://github.com/vibefi/docs',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} VibeFi contributors.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
