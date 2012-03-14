var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport'),
    User = require('../../model/user');
passport.use(new LocalStrategy(
    function (username, password, done) {

        User.findByUsernamePassword(username, password).findOne(function (err, user) {
            if (err)
                return done(err);

            if (!user)
                return done(null, false);

            return done(null, user);
        });
    }
));
passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(function (id, done) {
    User.findOne({_id:id}, function (err, user) {
        done(err, user);
    });
});

module.exports = passport;