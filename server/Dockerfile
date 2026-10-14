FROM node:20-bookworm-slim

WORKDIR /app

COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

COPY server/src ./src
RUN mkdir -p uploads && chown node:node uploads

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000

EXPOSE 3000

USER node
CMD ["npm", "start"]
