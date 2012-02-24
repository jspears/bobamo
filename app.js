/**
 * Module dependencies.
 */

var express = require('express')
    , routes = require('./routes')
    , mongoose = require('mongoose')
    , generate = require('./routes/generate')
    , rest = require('mongoose-express-rest')
//    , passport = require('./app/lib/passport')
    , fs = require('fs')
    ;

var app = module.exports = express.createServer();

// Configuration

app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jqtpl');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
//app.use(express.session({ secret:'big fat secret' }));
//    app.use(passport.initialize());
//    app.use(passport.session());
    app.use('/api', rest(mongoose))
    loadDir('./app/model');

//    generate(app);
});

app.configure('development', function () {
    mongoose.connect("mongodb://localhost/rapidjs_development");
    app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
});

app.configure('production', function () {
    mongoose.connect("mongodb://localhost/rapidjs");
    app.use(express.errorHandler());
});

// Routes

//app.get('/', routes.index);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
function loadDir(dir) {
    var loaded = {};
    var jsRe = /\.js$/;
    fs.readdirSync(dir).forEach(function (file) {
        var fPath = [dir, file].join('/');
        var stat = fs.statSync(fPath);
        if (stat.isFile() && jsRe.test(file)) {
            file = file.replace(jsRe, '');
            fPath = fPath.replace(jsRe, '');
            console.log('loading ', fPath, 'as', file);
            try {
                loaded[file] = require(fPath);
            } catch (e) {
                console.error('Error loading [' + fPath + '] ', e);
            }
        }
    });
    return loaded;
}