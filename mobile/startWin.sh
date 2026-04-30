#!/bin/bash
#from mobile directory
#./startWin.sh [localhost/ip]

if [ $1 == "ip" ]; then
    IN_WIFI=false
    IN_IPV4=false

    OUTPUT=$(ipconfig)
    for line in $OUTPUT;
    do
        if [ "$IN_WIFI" = true ]; then
            if [ "$IN_IPV4" = true ]; then
                if [[ "$line" =~ [[:digit:]]{1,3}.[[:digit:]]{1,3}.[[:digit:]]{1,3}.[[:digit:]]{1,3} ]]; then
                    IP=${BASH_REMATCH[0]}

                    cd src/config
                    jq -n --arg IP $IP '{"domain":$IP}' > env.local.json

                    echo starting with ip address
                    cd ../..
                    npx expo start
                    break
                fi
            elif [[ "$line" =~ IPv4 ]]; then
                IN_IPV4=true
            fi
        elif [[ "$line" =~ Wi-Fi ]]; then
            IN_WIFI=true
        fi
    done

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

