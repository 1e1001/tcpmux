@echo off
rmdir /s /q out
mkdir out
copy README.md+config.txt+tcpmux.bat out
echo deno bundle --unstable daemon.ts out\tcpmux.js
deno bundle --unstable daemon.ts out\tcpmux.js
echo # compile done
