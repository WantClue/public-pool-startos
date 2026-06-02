import { IMPOSSIBLE, VersionInfo, YAML } from '@start9labs/start-sdk'
import { readFile, rm } from 'fs/promises'
import { envFile } from '../file-models/env'

export const current = VersionInfo.of({
  version: '0.2.5:8',
  releaseNotes: {
    en_US: `**Internal**

- Bump start-sdk to 1.5.0`,
    es_ES: `**Interno**

- Actualización de start-sdk a 1.5.0`,
    de_DE: `**Intern**

- Aktualisierung von start-sdk auf 1.5.0`,
    pl_PL: `**Wewnętrzne**

- Aktualizacja start-sdk do 1.5.0`,
    fr_FR: `**Interne**

- Mise à jour de start-sdk vers 1.5.0`,
  },
  migrations: {
    up: async ({ effects }) => {
      const configYaml:
        | {
            'pool-identifier': string
          }
        | undefined = await readFile(
        '/media/startos/volumes/main/start9/config.yaml',
        'utf-8',
      ).then(YAML.parse, () => undefined)

      if (configYaml) {
        const POOL_IDENTIFIER = configYaml['pool-identifier'] ?? 'Public-Pool'

        await envFile.merge(effects, { POOL_IDENTIFIER })

        // remove old start9 dir
        await rm('/media/startos/volumes/main/start9', {
          recursive: true,
        }).catch(console.error)
      }
    },
    down: IMPOSSIBLE,
  },
})
