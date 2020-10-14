FROM mhart/alpine-node:12

LABEL maintainer="BitSky docker maintainers <help.bitskyai@gmail.com>"

# create app directory
WORKDIR /usr/bitsky

COPY ./ ./

# Only install production dependencies
RUN npm ci --only=production

EXPOSE 8081
CMD ["node", "index.js"]

# Metadata
LABEL bitsky.image.vendor="BitSky" \
    bitsky.image.url="https://www.bitsky.ai" \
    bitsky.image.title="BitSky Hello Retailer" \
    bitsky.image.description="An example retailer that crawl all blogs from https://exampleblog.bitsky.ai" \
    bitsky.image.documentation="https://docs.bitsky.ai"