/**
 * Module dependencies.
 */

var express = require('express')
    , jqtpl = require('jqtpl')
    , bobamo = require('bobamo')
    , passport = require('./lib/passport')
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
    app.use(express.session({ secret:'big fat secret' }));
    app.use(express.methodOverride());
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);


});
app.post('/', function (req, res, next) {
        next();
    }, passport.authenticate('local', { failureRedirect:'/check' }), function (req, res, next) {
        req.method = 'GET';
        req.url = '/rest/user/' + req.user._id;
        next();
    }
);

app.get('/check', function (req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) {
        req.method = 'GET';
        req.url = '/rest/user/' + req.user._id;
        next();
    } else {
        res.send({status:1, message:'Not Authenticated'})
    }

});
app.get('/logout', function (req, res) {
    req.logOut();
    res.redirect('/');
});
app.all(/\/rest\/*/i, function (req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated())
        return  next();
    res.redirect('/check');
});

app.configure('development', function () {
    app.use(bobamo.express({mongoose:mongoose}, express))
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
