#!/bin/sh

rm -r ../build/met/

node r.js -o build.js
cd ../build/met/

rm -r build.* r.js .git* docs
rm -r images/icon.xcf
rm -r stylesheets/libs/
rm -r javascripts/apps/met.js
rm -r javascripts/libs/codemirror/
rm -r javascripts/libs/jquery-2.0.3.js

mkdir log
rsync -r -v . webapp@repo.io:apps/met.repo.io/current/

find . -type f | grep -v MathJax
