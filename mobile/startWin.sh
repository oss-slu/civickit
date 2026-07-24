#!/bin/bash
# from mobile directory
#   ./startWin.sh           -> device/emulator on your LAN (recommended)
#   ./startWin.sh localhost -> emulator only, backend on localhost
#
# The API base URL is derived from the Metro host automatically, so there is
# nothing to configure by hand. Override it with EXPO_PUBLIC_API_URL when you
# need to point at a tunnel or a deployed backend, e.g.
#   EXPO_PUBLIC_API_URL=https://example.trycloudflare.com/api ./startWin.sh

if [ "$1" == "localhost" ]; then
    echo "starting with localhost"
    EXPO_PUBLIC_API_URL="http://localhost:3000/api" npx expo start
else
    echo "starting with LAN address from Metro"
    npx expo start
fi
