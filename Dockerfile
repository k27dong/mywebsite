FROM node:10 as builder

LABEL maintainer = "me@ke-fan.me"

WORKDIR /blog
COPY package*.json ./
RUN npm install
COPY src ./src
COPY public ./public
RUN npm run build

FROM nginx:1.19
COPY blog_nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /blog/build /blog/build
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
