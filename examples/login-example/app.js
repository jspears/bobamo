/**
 * Module dependencies.
 */

var express = require('express')
    , jqtpl = require('jqtpl')
    , bobamo = require('bobamo')
    , mongoose = require('mongoose')
    , User = require('bobamo/examples/model/user')
    , Employee = require('bobamo/examples/model/employee')
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
    app.use(express.query());
    app.use(express.session({ secret:'big fat secret' }));
    app.use(express.methodOverride());
    app.use(bobamo.express({mongoose:mongoose, plugin:'passport', authModel:User}, express))
    app.use(app.router);


});


app.configure('development', function () {

    mongoose.connection.on('open', function () {
        User.find({username:'admin'}, function (err, obj) {
            if (err) {
                console.log('error', err);
                return;
            }
            if (!obj) {
               new User({
                    username:'admin',
                    password:'admin',
                    twitter:'@nowhere'
                }).save(function (err, obj) {
                    console.log('added user', err, obj);
                });
            }
        });
    });

    mongoose.connect('mongodb://localhost/bobamo_development');
    app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
});


app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
