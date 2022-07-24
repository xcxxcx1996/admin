FROM node:17.1.0


RUN sed -i s@/deb.debian.org/@/mirrors.aliyun.com/@g /etc/apt/sources.list
RUN sed -i s@/security.debian.org/@/mirrors.aliyun.com/@g /etc/apt/sources.list
RUN apt-get update && apt-get install -y python3 python libvips-dev glib2.0-dev --no-install-recommends


COPY package.json /tmp/package.json
RUN yarn config set registry https://registry.npm.taobao.org/
RUN npm config set registry https://registry.npm.taobao.org
RUN cd /tmp && yarn install
RUN mkdir -p /app/medusa-storefront && cp -a /tmp/node_modules /app/medusa-storefront/


WORKDIR /app/medusa-storefront

COPY . /app/medusa-storefront
EXPOSE 8000
#RUN ["yarn","build"]

