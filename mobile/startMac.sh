#!/bin/bash
#should be called from mobile directory

# IP_LINE=$(ipconfig | grep IPv4 )
IP=$(ipconfig getifaddr en0)

cd src/config
jq -n --arg IP $IP '{"ip":$IP}' > env.local.json

cd ../..
npx expo start