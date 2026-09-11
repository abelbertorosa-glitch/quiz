FROM node:22-bookworm-slim AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
ENV SKIP_CHROMIUM_COPY=1
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY . .
ARG NEXT_PUBLIC_SITE_ORIGIN=http://179.197.65.2:3060
ARG NEXT_PUBLIC_BASE_URL=http://179.197.65.2:3060/diagnostico
ENV NEXT_PUBLIC_SITE_ORIGIN=$NEXT_PUBLIC_SITE_ORIGIN
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV SKIP_CHROMIUM_COPY=1
RUN pnpm build

FROM mcr.microsoft.com/playwright:v1.62.1-noble
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV DATA_DIR=/data
ENV PDF_INTERNAL_BASE_URL=http://127.0.0.1:3000/diagnostico
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules/playwright-core ./node_modules/playwright-core
COPY deploy/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh && mkdir -p /data
EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]
