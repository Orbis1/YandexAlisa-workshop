FROM node:14-alpine

WORKDIR /alice

COPY package*.json ./
RUN npm install

