FROM node:24-alpine

WORKDIR /opt

LABEL org.opencontainers.image.source=https://github.com/lannonbr/weeknotes-dashboard

COPY . .
RUN npm install

ENTRYPOINT [ "npm" ]
CMD ["run", "dev"]
