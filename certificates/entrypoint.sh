#!/bin/bash
set -e

MODE=""
PASSWORD=""
ARGS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --mode)
      MODE="$2"
      shift 2
      ;;
    --password)
      PASSWORD="$2"
      shift 2
      ;;
    *)
      ARGS+=("$1")
      shift
      ;;
  esac
done

case "$MODE" in
  ca)
    CA_NAME="${ARGS[0]}"
    SUBJECT="${ARGS[1]}"

    /certgen/create-ca.sh "$CA_NAME" "$SUBJECT" "$PASSWORD"
    cp "$CA_NAME".* /output/
    ;;

  client)
    DOMAIN="${ARGS[0]}"
    CERT_NAME="${ARGS[1]}"
    CA_CERT="${ARGS[2]}"
    CA_KEY="${ARGS[3]}"
    SUBJECT="${ARGS[4]}"
    USAGE="${ARGS[5]}"

    /certgen/create-client-cert.sh \
      "$DOMAIN" "$CERT_NAME" "$CA_CERT" "$CA_KEY" "$SUBJECT" "$USAGE" "$PASSWORD"

    cp "$CERT_NAME".* /output/
    ;;

  *)
    echo "Unknown mode. Use --mode ca OR --mode client"
    exit 1
    ;;
esac