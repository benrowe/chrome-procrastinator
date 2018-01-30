#!/bin/bash

BASE_DIR="./dist/"

# Deploy the current contents of ./dist
if [ ! -d "$BASE_DIR" ]; then
    echo "Please compile build first"
    exit 1
fi

# zip the contents of the directory
if [ -f "$BASE_DIR/deploy.zip" ]; then
    rm "$BASE_DIR/deploy.zip"
fi
cd dist; zip -r ../deploy.zip *

