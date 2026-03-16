#!/bin/bash
#from mobile directory
#./startWin.sh [localhost/ip]

if [ $1 == "ip" ]; then
    IP_LINE=$(ipconfig | findstr IPv4 )

    if [[ "$IP_LINE" =~ [[:digit:]]{1,3}.[[:digit:]]{1,3}.[[:digit:]]{1,3}.[[:digit:]]{1,3} ]]; then
        IP=${BASH_REMATCH[0]}

        cd src/config
        jq -n --arg IP $IP '{"domain":$IP}' > env.local.json

        echo starting with ip address
        cd ../..
        npx expo start
    else 
        echo no ipv4 found
    fi

    
elif [ $1 == "localhost" ]; then
    LOCALHOST="localhost"
    cd src/config
    jq -n --arg LOCALHOST $LOCALHOST '{"domain":$LOCALHOST}' > env.local.json
    
    echo starting with localhost
    cd ../..
    npx expo start
else 
    echo specify either "./startWin localhost" or "./startWin ip"
fi

