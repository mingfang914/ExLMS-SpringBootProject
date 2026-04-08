FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# We need ts-node to run the project
RUN npm install -g ts-node typescript

COPY . .

EXPOSE 1234

CMD ["ts-node", "index.ts"]
