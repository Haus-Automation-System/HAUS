rm -rf data/*
mkdir -p data/mongo
chmod -R 777 data

mkdir -p haus_client/certs
cd haus_client/certs
openssl req -newkey rsa:4096  -x509  -sha512  -days 365 -nodes -out certificate.pem -keyout privatekey.pem
cd ../..

mkdir -p haus_api/certs