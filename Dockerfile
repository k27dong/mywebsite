FROM ubuntu:18.04

LABEL maintainer = "me@ke-fan.me"

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get -y --no-install-recommends install apt-utils build-essential ca-certificates \
    zlib1g-dev libncurses5-dev libgdbm-dev libnss3-dev libssl-dev \
    libsqlite3-dev libreadline-dev libffi-dev wget libbz2-dev curl && \
    wget https://www.python.org/ftp/python/3.7.7/Python-3.7.7.tgz && \
    tar -xf Python-3.7.7.tgz && \
    cd Python-3.7.7 && \
    ./configure --enable-optimization && \
    make && \
    make install && \
    python3 --version && \
    cd ../ && \
    curl -sL https://deb.nodesource.com/setup_12.18.2 | -E bash - && \
    apt-get install -y nodejs && \
    node -v

WORKDIR /blog

COPY package*.json ./
RUN npm install --no-optional

# FROM nginx:1.19
# COPY blog_nginx.conf /etc/nginx/conf.d/default.conf
# COPY --from=nodebuilder /blog/build /blog/build
# EXPOSE 3000
# CMD ["nginx", "-g", "daemon off;"]

# FROM python:3.7.7
# COPY ./requirements.txt ./
# RUN pip3 install --upgrade pip && pip3 install -r requirements.txt
# COPY ./app/ ./app/
# COPY ./docs/ ./docs/
# CMD [ "python3", "./app/app.py" ]

