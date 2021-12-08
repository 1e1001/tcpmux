@echo off
rmdir /s /q out
mkdir out
rem windows is stupid and won't copy it on one line, for some reason
copy README.md out
copy src\config.txt out
copy scripts\tcpmux.bat out
echo deno bundle --unstable src\daemon.ts out\tcpmux.js
deno bundle --unstable src\daemon.ts out\tcpmux.js
echo # compile done
