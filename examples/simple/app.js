/**
 * Module dependencies.
 */

var express = require('express')
    , routes = require('./routes')
    , User = require('bobamo/examples/model/user')
    , Group = require('bobamo/examples/model/group')
    , Employee = require('bobamo/examples/model/employee')
    , bobamo = require('bobamo')
    , http = require('http')
    ;

var app = module.exports = express();

// Configuration

app.configure(function () {
//    app.set('views', __dirname + '/views');
//    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({secret:'super duper secret'}))
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function () {
    app.use('/bobamo', bobamo.express({plugin:['session','imageupload','visualize'], uri:'mongodb://localhost/bobamo_development'}));

    app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
});

app.configure('production', function () {
    app.use('/bobamo', bobamo.express({uri:'mongodb://localhost/bobamo'}, express));

    app.use(express.errorHandler());
});

// Routes

app.get('/', function(req,res){ res.render('redir_index.html', {layout:false})});

app.listen(3001);
http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'), app.settings.env);
});