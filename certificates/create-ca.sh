#!/bin/bash
set -e

CA_NAME=$1
SUBJECT=$2
PASSWORD=$3

if [ -z "$PASSWORD" ]; then
  # No password
  openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 \
    -subj "$SUBJECT" \
    -addext keyUsage=keyCertSign \
    -keyout "$CA_NAME.key" \
    -out "$CA_NAME.crt"
else
  # Password-protected CA key
  openssl req -newkey rsa:2048 -new -x509 -days 3650 \
    -subj "$SUBJECT" \
    -addext keyUsage=keyCertSign \
    -passout pass:"$PASSWORD" \
    -keyout "$CA_NAME.key" \
    -out "$CA_NAME.crt"
fi