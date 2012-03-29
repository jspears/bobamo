/**
 * Module dependencies.
 */

var express = require('express')
    , jqtpl = require('jqtpl')
    , fs = require('fs')
    , bobamo = require('bobamo')
    , passport = require('./lib/passport')
    , mongoose = require('mongoose')
    ;

var app = module.exports = express.createServer();
//app.use(bobamo.express({mongoose:mongoose, uri:'mongodb://localhost/bobamo_development'}, express));

// Configuration
app.configure(function () {
    app.use(express.static(__dirname + '/public'));
    app.set('views', __dirname + '/views');
    app.set('view engine', 'html');
    app.register('.html', jqtpl.express);
    app.register('.js', jqtpl.express);
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.session({ secret:'big fat secret' }));
    app.use(express.methodOverride());
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    //  app.use(bobamo.express());
    app.dynamicHelpers({
        isAuthenicated:function (req, res) {
            return req.isAuthenticated();
        }
    });

    loadDir('../model');

});
app.post('/', function (req, res, next) {
        next();
    }, passport.authenticate('local', { failureRedirect:'/check' }), function (req, res, next) {
        req.method = 'GET';
        req.url = '/api/user/'+req.user._id;
        next();
    }
);

app.get('/check', function (req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) {
        req.method = 'GET';
        req.url = '/api/user/'+req.user._id;
        next();
    } else {
        res.send({status:1, message:'Not Authenticated'})
    }

});
app.get('/logout', function (req, res) {
    req.logOut();
    res.redirect('/');
});
app.all(/\/api\/*/, function (req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated())
        return  next();
    res.redirect('/check');
});

app.configure('development', function () {
    app.use(bobamo.express({mongoose:mongoose}, express))
    mongoose.connect('mongodb://localhost/bobamo_development');
    app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
});

app.configure('production', function () {
    app.use(bobamo.express({mongoose:mongoose}, express))
    mongoose.connect('mongodb://localhost/bobamo');
    app.use(express.errorHandler());
});


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
