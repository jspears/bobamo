/**
 * Module dependencies.
 */

var express = require('express')
    , routes = require('./routes')
    , mongoose = require('mongoose')
    , generate = require('./routes/generate')
    , rest = require('mers')
    , jqtpl = require('jqtpl')
    , util = require('mers/lib/util')
    , passport = require('./app/lib/passport')
    , fs = require('fs')
    , expose = require('express-expose')
    , factory = require('./app/lib/display-factory').DisplayFactory
    , strUtil = require('./app/lib/string');
    ;

var app = module.exports = express.createServer();


// Configuration
app.use(express.static(__dirname + '/public'));
app.configure(function () {
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

    generate(app);
    app.dynamicHelpers({
        isAuthenicated:function (req, res) {
            return req.isAuthenticated();
        },
        createSchema:function (req, res) {
            return function onSchema(Model) {
                return JSON.stringify(factory.createSchema(Model, req.user).paths);
            }
        },
        createFields:function(req, res){
            return function onFields(Model){
                return JSON.stringify( factory.createFields(Model, req.user));
            }
        },
        createDefaults:function(req, res){
            return function onDefaults(Model){
                return  JSON.stringify(factory.createDefaults(Model, req.user));
            }
        },
        toTitle:function(req,res){
            return function onToTitle(Model){
                return factory.createTitle(Model, req.user);
            }
        }

    });
    loadDir('./app/model');

});

app.configure('development', function () {
    mongoose.connect('mongodb://localhost/mojaba_development')
    app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
});

app.configure('production', function () {
    mongoose.connect('mongodb://localhost/mojaba')
    app.use(express.errorHandler());
});
//app.exposeRequire();
app.expose(app.settings, 'settings');
//app.get('/stuff',function(req,res,next){
//    var user = require('./tests/example-model');
//    res.expose(user, 'express.current.user');
//    res.setHeader('Content-Type:', 'text/javascript')
//    res.render('expose.js', {layout:false})
//  })
//app.exposeModule(__dirname + '/app/lib/string', 'toTitle');
// Routes
app.get('/', routes.index);
app.post('/', passport.authenticate('local', { failureRedirect:'/check' }), function (req, res, next) {
    return res.send({
        status:0,
        payload:req.user
    });

});

app.get('/check', function (req, res, next) {
    var obj = {};
    if (req.isAuthenticated && req.isAuthenticated()) {
        obj = {status:0, payload:req.user};
    } else {
        obj = {status:1};
    }

    res.send(obj)
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
//app.get('/', routes.index);
app.all(/\/api\/*/, function (req, res, next) {
    req.query.transform = util.split(req.query.transform, ',', ['_idToId']);
    next();
})
app.get('/api/employee/:id/reports', function (req, res, next) {
    req.query.populate = util.split(req.query.populate, ',', ['reports']);

    next();
})

app.use('/api', rest({
    mongoose:mongoose,
    transformers:{
        _idToId:function () {
            return function (obj) {
                if (!obj.toObject)
                    return obj;

                var o = obj.toObject();
                o.id = obj._id;
                delete o._id;
                delete o.id_;
                delete o.managerId_;
                var manager = obj.manager;
                o.managerFirstName = manager ? manager.firstName : '';
                o.managerLastName = manager ? manager.lastName : '';
                o.managerId = manager && manager._id ? manager._id.toString() : manager || '';
                delete o.reports;
                delete o.manager;
                return o;
            }
        }
    }

}).rest());

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