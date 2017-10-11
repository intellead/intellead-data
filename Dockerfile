FROM node:8.6.0-alpine

WORKDIR /usr/src/intellead/intellead-data/app

COPY package.json ./

RUN npm install --silent --progress=false --production

COPY app.js ./

COPY bin/ ./bin

COPY public/stylesheets/ ./public/stylesheets

COPY src/ ./src

COPY views/ ./views

EXPOSE 3000

CMD ["npm", "start"]