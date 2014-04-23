var fs = require('fs'), path = require('path');
"use strict";

var red = '\u001b[31m',
    blue = '\u001b[34m',
    green = '\u001b[32m',
    reset = '\u001b[0m';
function help(msg, exit) {
    var err = process.stderr;
    if (msg) {
        err.write(red + 'ERROR: ' + msg + reset + '\n');
    }
    err.write('This application will start a new ' + green + 'bobamo' + reset + ' instance\n' +
        '\t -h help \n' +
        '\t -f file <existing conf>\n' +
        '\t -p port 3000\n' +
        '\t -P plugins <plugin1,plugin2>\n'+
        '\t -c context \ \n' +
        '\t directory <dir>\n');

    if (exit) {
        process.exit(exit);
    }
};
var _port = 3000, _context = '/', _plugins=[], _mongodb;


function port(p) {
    var _p = parseInt(p)
    if (!p || isNaN(_p)) {
        help('Not a valid port "' + p + '"', 1);
    }
    _port = _p;
}

function dir(d) {
    d = path.resolve(d);
    if (!fs.existsSync(d)) {
        help('Refuse to use directory ' + d, 1);
    }

    try {
        process.chdir(d);
    } catch (e) {
        console.warn(e);
        help('Could not change into directory ' + d, 1);
    }
    if (fs.existsSync(path.join(d, 'public'))) {
        fs.mkdirSync(path.join(d, 'public'));
    }
    if (!_mongodb){
        _mongodb = 'mongodb://localhost/bobamo_development_'+path.basename(d)
    }
    console.log(green + 'Bobamo' + reset + ' booting in: ' + d)
    require('../index').app({basepath:d, uri:_mongodb, plugin:_plugins}, '/').listen(_port);
    console.log('open your browser in ' + green + 'http://localhost:' + _port + _context +reset+' with '+green+ _mongodb+reset)
}
function context(ctx) {
    if (!ctx) {
        help('not a valid context', 1);
    }
    _context = ctx[0] == '/' ? ctx : '/' + ctx;
}
function plugin(plugins){
    if (!plugins){
        help('not a valid plugin', 1);
    }
    _plugins = plugins.split(/\s*,\s*/);

}
function mongo(arg){
    if (!arg){
        help('not a valid mongodb url', 1);
    }
    if (!/^mongodb:\/\//.test(arg)){
        arg = 'mongodb://'+arg
    }
    _mongodb = arg;
}
function processArgv(argv) {
    if (argv.length == 0) {
        help('no arguments given', 1)
    }
    while (argv.length) {
        var a = argv.shift();
        switch (a) {
            case '-h':
                help(null, 1);
                break;
            case '-c':
                context(argv.shift());
                break;
            case '-f':
                file(argv.shift());
                break;
            case '-P':
                plugin(argv.shift());
                break;
            case '-p':
                port(argv.shift());
                break;
            case '-m':
                mongo(argv.shift());
                break;
            default:
            {
                if (argv.length == 0) {
                    dir(a)
                } else {
                    help('unknown option ' + a, 1);
                }
            }
                ;

        }
    }
}
module.exports = processArgv;