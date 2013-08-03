#!/usr/bin/env node

var lint = require("./lint/lint");

lint.checkDir("javascripts/apps");
lint.checkFile("javascripts/app.js");
lint.checkFile("javascripts/libs/marked.js");
lint.checkFile("tests/index.js");

console.log("LINT: " + lint.success());
