FROM node
LABEL maintainer="moondropx"

# FROM https://hub.docker.com/r/wernight/phantomjs/dockerfile
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
  ca-certificates \
  bzip2 \
  libfontconfig \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

RUN set -x  \
  && apt-get update \
  && apt-get install -y fonts-wqy-microhei \
  && apt-get install -y --no-install-recommends curl \
  && mkdir /tmp/phantomjs \
  && curl -L https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-2.1.1-linux-x86_64.tar.bz2 \
  | tar -xj --strip-components=1 -C /tmp/phantomjs \
  && mv /tmp/phantomjs/bin/phantomjs /usr/local/bin \
  # && curl -Lo /tmp/dumb-init.deb https://github.com/Yelp/dumb-init/releases/download/v1.1.3/dumb-init_1.1.3_amd64.deb \
  # && dpkg -i /tmp/dumb-init.deb \
  && apt-get purge --auto-remove -y curl \
  && apt-get clean \
  && rm -rf /tmp/* /var/lib/apt/lists/* \
  && useradd --system --uid 52379 -m --shell /usr/sbin/nologin phantomjs \
  && su phantomjs -s /bin/sh -c "phantomjs --version"

WORKDIR /root
COPY dist dist
WORKDIR /root/dist
COPY package.json .
COPY yarn.lock .
RUN yarn install --production

ENTRYPOINT [ "node", "/root/dist/index.js" ]