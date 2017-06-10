#!/bin/bash

if [ ! -e "./bin" ] || [ ! -d "./bin" ]; then
	mkdir "./bin"
fi

browserify -r "./src/Kernel.js":ChirpOS > "./bin/ChirpOS.js"
minify "./bin/ChirpOS.js" -o "./bin/ChirpOS.min.js"
