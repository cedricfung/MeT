#!/bin/sh

rm -r ../build/met/

node r.js -o build.js
cd ../build/met/

rm -r build.* r.js .git* tests config
rm -r images/icon.xcf
rm -r stylesheets/libs/
rm -r javascripts/apps/met.js
rm -r javascripts/apps/db.js
rm -r javascripts/apps/list.js
rm -r javascripts/libs/zepto.js
rm -r javascripts/libs/codemirror/

mkdir log
rsync -r -v . webapp@repo.io:apps/met.repo.io/current/

find . -type f | grep -v MathJax
