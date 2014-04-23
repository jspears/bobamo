#!/usr/bin/env node
try {
    var reporter = require('nodeunit').reporters.default;
}
catch(e) {
    console.log("Cannot find nodeunit module.");
    console.log("You can download submodules for this project by doing:");
    console.log("npm install nodeunit");
    console.log("");
    process.exit();
}

process.chdir(__dirname);
reporter.run(['tests']);