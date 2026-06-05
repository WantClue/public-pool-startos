FROM node:20-bookworm-slim AS build

# Public Pool repo does not use versions/tags yet, point directly to commit sha
ARG PUBLIC_POOL_SHA=95565eeec41ebdc9eca7c9aa7413f7cded6342b8
ARG PUBLIC_POOL_UI_SHA=1c0b2d93e3ce0a81d4faa7b1d444ace936e3f63d

RUN \
    apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    build-essential ca-certificates cmake curl git python3 wget && \
    apt clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /build

RUN \
    git clone https://github.com/benjamin-wilson/public-pool.git && \
    cd public-pool && \
    git checkout ${PUBLIC_POOL_SHA}

RUN \
    cd public-pool && \
    npm ci --no-audit --no-fund && \
    NODE_ENV=production npm run build && \
    npm prune --production

RUN \
    git clone https://github.com/benjamin-wilson/public-pool-ui.git && \
    cd public-pool-ui && \
    git checkout ${PUBLIC_POOL_UI_SHA}

# patch environment.prod.ts for self-hosting
COPY assets/patches/environment.prod.ts /build/public-pool-ui/src/environments/environment.prod.ts
COPY assets/patches/public-pool-ui.patch /build/public-pool-ui/public-pool-ui.patch

RUN \
    cd public-pool-ui && \
    git apply public-pool-ui.patch && \
    npm ci --no-audit --no-fund && \
    NODE_ENV=production npm run build && \
    npm prune --production

# main container
FROM node:20-bookworm-slim

ENV NODE_ENV=production

WORKDIR /public-pool

RUN \
    apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    nginx && \
    apt clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

COPY ./assets/nginx.conf /etc/nginx/sites-available/default

COPY --from=build /build/public-pool/node_modules ./node_modules
COPY --from=build /build/public-pool/dist ./dist

WORKDIR /var/www/html
COPY --from=build /build/public-pool-ui/dist/public-pool-ui .
