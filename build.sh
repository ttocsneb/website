#!/bin/bash
if [ -e dist ]; then
    rm -r dist
fi
npm run build && \
npm run sass && \
npm run compile && \
cp -r images dist/images