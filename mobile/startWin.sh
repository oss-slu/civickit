#!/bin/bash
#should be called from mobile directory

IP_LINE=$(ipconfig | findstr IPv4 )
IP=${IP_LINE:39:14}

cd src/config
jq -n --arg IP $IP '{"ip":$IP}' > env.local.json

cd ../..
npx expo start