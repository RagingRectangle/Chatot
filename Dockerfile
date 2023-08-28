FROM node:16

WORKDIR /usr/src/app

COPY ../Chatot-dev .
RUN npm install

CMD ["node", "chatot.js"]