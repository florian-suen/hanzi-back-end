FROM node:alpine AS base
WORKDIR /app
COPY package*.json /app/
RUN npm install
COPY . .

FROM base AS build
WORKDIR /app
RUN npm build

FROM base AS dev
WORKDIR /app
ENV NODE_ENV development
RUN apk add --update bash
EXPOSE 4000
CMD ["npm","start"]

FROM node:alpine AS prod
WORKDIR /app
COPY package.json ./app
ENV NODE_ENV production
RUN npm install --only=prod
COPY --from=build  ./lib ./lib
EXPOSE 4000
CMD ["npm","start-prod"]

