# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Truyền biến môi trường vào lúc Build
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_LIVEKIT_TOKEN_SERVICE_URL
ARG VITE_LIVEKIT_SERVER_URL

ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_LIVEKIT_TOKEN_SERVICE_URL=$VITE_LIVEKIT_TOKEN_SERVICE_URL
ENV VITE_LIVEKIT_SERVER_URL=$VITE_LIVEKIT_SERVER_URL

RUN npm run build

# Stage 2: Serve
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
