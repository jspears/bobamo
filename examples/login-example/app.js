/**
 * Module dependencies.
 */

var bobamo    = require('bobamo')
    , User      = require('bobamo/examples/model/user')
    , Employee  = require('bobamo/examples/model/employee')
    , Group  = require('bobamo/examples/model/group')
    ;
var mongoose = bobamo.mongoose;
var app = bobamo.app({mongoose:mongoose, plugin:['passport','imageupload'], authModel:User});


app.configure('development', function () {

    mongoose.connection.on('connected',  function () {

        User.findOne({username:'admin'}, function (err, obj) {
            console.log('here');
            if (err) {
                console.log('error', err);
                return;
            }
            if (!obj) {
                console.log('admin not found creating')
                new User({
                    username:'admin',
                    password:'admin',
                    twitter:'@nowhere'
                }).save(function (err, obj) {
                        console.log('added user', obj);
                    });
            }  else {
                console.log('using admin', obj.username, obj.password);
            }
        });
    });

    mongoose.connect('mongodb://localhost/bobamo_development');
});


app.listen(3000);
console.log("Express server listening on port 3000 in %s mode", app.env);
