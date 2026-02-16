#!/bin/bash
set -e

DOMAIN=$1
CERT_NAME=$2
CA_CERT=$3
CA_KEY=$4
SUBJECT=$5
USAGE=$6
PASSWORD=$7

# Generate private key
openssl genrsa -out "$CERT_NAME.key" 2048

# CSR
openssl req -new -key "$CERT_NAME.key" -out "$CERT_NAME.csr" -subj "$SUBJECT"

# Extensions
cat > "$CERT_NAME.ext" << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
extendedKeyUsage = $USAGE
subjectAltName = @alt_names
[alt_names]
DNS.1 = $DOMAIN
EOF

# Sign certificate
openssl x509 -req \
  -in "$CERT_NAME.csr" \
  -CA "$CA_CERT" \
  -CAkey "$CA_KEY" \
  -CAcreateserial \
  -out "$CERT_NAME.crt" \
  -days 3650 \
  -sha256 \
  -extfile "$CERT_NAME.ext"

# Create PFX (with or without password)
if [ -z "$PASSWORD" ]; then
  openssl pkcs12 -export \
    -out "$CERT_NAME.pfx" \
    -inkey "$CERT_NAME.key" \
    -in "$CERT_NAME.crt" \
    -passout pass:
else
  openssl pkcs12 -export \
    -out "$CERT_NAME.pfx" \
    -inkey "$CERT_NAME.key" \
    -in "$CERT_NAME.crt" \
    -passout pass:"$PASSWORD"
fi

# PEM
cat "$CERT_NAME.key" "$CERT_NAME.crt" > "$CERT_NAME.pem"