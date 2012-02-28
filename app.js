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
//    , passport = require('./app/lib/passport')
    , fs = require('fs')
    ;

var app = module.exports = express.createServer();


// Configuration
app.use(express.static(__dirname + '/public'));
app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'html');
    app.register('.html', jqtpl.express);
    app.register('.js', jqtpl.express);
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);

    generate(app);

//app.use(express.session({ secret:'big fat secret' }));
//    app.use(passport.initialize());
//    app.use(passport.session());
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

// Routes

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
    mongoose:    mongoose,
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