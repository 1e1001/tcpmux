@echo off
rmdir /s /q out
mkdir out
copy README.md+src\config.txt+scripts\tcpmux.bat out
echo deno bundle --unstable src\daemon.ts out\tcpmux.js
deno bundle --unstable src\daemon.ts out\tcpmux.js
echo # compile done
