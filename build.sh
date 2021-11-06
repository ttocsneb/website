#!/bin/bash
rm -r dist && \
npm run build && \
npm run sass && \
npm run compile && \
cp -r images dist/images