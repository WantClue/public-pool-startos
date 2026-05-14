import { autoconfig } from 'bitcoin-core-startos/startos/actions/config/autoconfig'
import { sdk } from './sdk'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  // bitcoin-core-startos still ships start-sdk 1.3.3; its Action type doesn't
  // structurally match 1.5.0's Action (Manifest fields diverged across
  // versions), so the generic input-spec inference collapses. Cast through any
  // until bitcoin-core-startos updates.
  await sdk.action.createTask(
    effects,
    'bitcoind',
    autoconfig as any,
    'critical',
    {
      input: { kind: 'partial', value: { zmqEnabled: true } },
      reason: 'Must enable ZMQ in Bitcoin to use it with Public Pool',
      when: { condition: 'input-not-matches', once: false },
    },
  )

  return {
    bitcoind: {
      kind: 'running',
      versionRange: '>=28.3:7',
      healthChecks: ['bitcoind'],
    },
  }
})
