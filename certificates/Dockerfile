FROM alpine:3.19

RUN apk add --no-cache openssl bash

WORKDIR /certgen

COPY entrypoint.sh /certgen/entrypoint.sh
COPY create-client-cert.sh /certgen/create-client-cert.sh
COPY create-ca.sh /certgen/create-ca.sh

RUN chmod +x /certgen/*.sh

ENTRYPOINT ["/certgen/entrypoint.sh"]