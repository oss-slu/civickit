#!/bin/bash
#from mobile directory
#./startWin.sh [localhost/ip]

if [ $1 == "ip" ]; then
    IP=$(ipconfig getifaddr en0)

    cd src/config
    jq -n --arg IP $IP '{"domain":$IP}' > env.local.json

    echo starting with ip address
    cd ../..
    npx expo start
elif [ $1 == "localhost" ]; then
    LOCALHOST="localhost"
    cd src/config
    jq -n --arg LOCALHOST $LOCALHOST '{"domain":$LOCALHOST}' > env.local.json
    
    echo starting with localhost
    cd ../..
    npx expo start
else 
    echo specify either "./startMac localhost" or " ./startMac ip"
fi