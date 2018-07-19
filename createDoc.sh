#!/bin/bash
path=$(pwd -P)
for file in $path/src/*.js; do
    jsdoc2md $file >  $path/spec/markdown/$(basename "$file" .js).md
done