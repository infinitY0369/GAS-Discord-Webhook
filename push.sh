cd `dirname $0`

node build.js
clasp push -A .clasprc.json
