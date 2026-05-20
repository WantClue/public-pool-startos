# Updating the upstream version

Public Pool has no upstream tags or releases on either repo — both the backend ([benjamin-wilson/public-pool](https://github.com/benjamin-wilson/public-pool)) and the UI ([benjamin-wilson/public-pool-ui](https://github.com/benjamin-wilson/public-pool-ui)) are tracked by commit SHA on `master`. The manifest's image is built from source (`dockerBuild`), so there is no `dockerTag` to bump.

## Determining the upstream version

- **Backend** — [benjamin-wilson/public-pool](https://github.com/benjamin-wilson/public-pool). Latest `master` commit:
  ```sh
  gh api repos/benjamin-wilson/public-pool/commits/master --jq '.sha'
  ```
  Pin lives in `Dockerfile` as `ARG PUBLIC_POOL_SHA`.

- **UI** — [benjamin-wilson/public-pool-ui](https://github.com/benjamin-wilson/public-pool-ui). Latest `master` commit:
  ```sh
  gh api repos/benjamin-wilson/public-pool-ui/commits/master --jq '.sha'
  ```
  Pin lives in `Dockerfile` as `ARG PUBLIC_POOL_UI_SHA`.

## Applying the bump

- **Backend** — update `ARG PUBLIC_POOL_SHA=<new sha>` at the top of `Dockerfile`.
- **UI** — update `ARG PUBLIC_POOL_UI_SHA=<new sha>` at the top of `Dockerfile`. If `public-pool-ui` changed in ways that affect `assets/patches/public-pool-ui.patch` or `assets/patches/environment.prod.ts`, refresh those patches against the new SHA.
