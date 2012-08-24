/**
 * Module dependencies.
 */

var express = require('express')
    , bobamo = require('bobamo')
    , mongoose =require('mongoose')
    , geomodel =require('./lib/geomodel')
    //, favorite = require('./lib/favorite')
    , path = require('path')
    ;

var app = module.exports = express();

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
    mongoose.connect('mongodb://localhost/geomodel_development');
    app.use(bobamo.express({mongoose:mongoose, plugin:['geo']}));

    app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
});


// Routes

app.get('/', function(req,res){ res.redirect('/index.html')});

app.listen(3002, function(){
console.log("Express server listening on port %d in %s mode", app.address, app.settings.env, arguments);
});