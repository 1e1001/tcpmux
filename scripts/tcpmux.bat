@echo off
deno run --allow-read=config.txt --allow-net --unstable tcpmux.js config.txt
