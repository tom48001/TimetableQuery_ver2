FROM node:16-bookworm-slim AS build

WORKDIR /app

COPY client/package.json client/package-lock.json ./
# The legacy test-only PhantomJS package has no Linux/ARM64 binary and is not
# needed to compile the production Vue bundle.
RUN npm ci --ignore-scripts

COPY client/ ./
RUN npm run build

FROM nginx:1.27-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
