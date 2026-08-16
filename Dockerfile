FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY bin ./bin
COPY src ./src
COPY dashboard ./dashboard
COPY test ./test

EXPOSE 4173

CMD ["sh", "-c", "node bin/cdos.js init && node bin/cdos.js dashboard --host 0.0.0.0"]
