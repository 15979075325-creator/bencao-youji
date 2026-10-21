FROM node:22-alpine
WORKDIR /app
COPY . .
RUN node build-cloud.cjs
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
EXPOSE 3000
USER node
CMD ["node", "server.js"]
