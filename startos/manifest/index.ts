import { setupManifest } from '@start9labs/start-sdk'
import { bitcoindDescription, long, short } from './i18n'

export const manifest = setupManifest({
  id: 'public-pool',
  title: 'Public Pool',
  license: 'GPL',
  packageRepo: 'https://github.com/Start9Labs/public-pool-startos',
  upstreamRepo: 'https://github.com/benjamin-wilson/public-pool',
  marketingUrl: 'https://web.public-pool.io',
  donationUrl: 'https://web.public-pool.io',
  description: { short, long },
  volumes: ['main'],
  images: {
    'public-pool': {
      source: {
        dockerBuild: {},
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {
    bitcoind: {
      description: bitcoindDescription,
      optional: false,
      metadata: {
        title: 'Bitcoin',
        icon: 'https://raw.githubusercontent.com/Start9Labs/bitcoin-core-startos/feec0b1dae42961a257948fe39b40caf8672fce1/dep-icon.svg',
      },
    },
  },
})
