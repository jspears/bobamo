/**
 * Module dependencies.
 */

var express = require('express')
    , routes = require('./routes')
    , User = require('../model/user')
    , Group = require('../model/group')
    , Employee = require('../model/employee')
    , mojaba = require('mojaba')
    , jqtpl = require('jqtpl')
    ;

var app = module.exports = express.createServer();

// Configuration

app.configure(function () {
//    app.set('views', __dirname + '/views');
//    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function () {
    app.use('/mojaba', mojaba.express({uri:'mongodb://localhost/mojaba_development'}, express));

    app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
});

app.configure('production', function () {
    app.use('/mojaba', mojaba.express({uri:'mongodb://localhost/mojaba'}, express));

    app.use(express.errorHandler());
});

// Routes

app.get('/', function(req,res){ res.redirect('/index.html')});

app.listen(3001);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
