@echo off
rmdir /s /q out
mkdir out
copy README.md+config.txt+tcpmux.bat out
echo deno bundle --unstable daemon.ts out\tcpmux.compiled.js
deno bundle --unstable daemon.ts out\tcpmux.compiled.js
echo node terser\node_modules\terser\bin\terser --module -m reserved=['_'] out\tcpmux.compiled.js -c -o out\tcpmux.js
node terser\node_modules\terser\bin\terser --module -m reserved=['_'] out\tcpmux.compiled.js -c -o out\tcpmux.js
del out\tcpmux.compiled.js
echo # compile done
