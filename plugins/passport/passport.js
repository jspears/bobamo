var PluginApi = require('../../index').PluginApi, util = require('util'), LocalStrategy = require('passport-local').Strategy, passport = require('passport'), crypto = require('crypto');


var PassportPlugin = function () {
    PluginApi.apply(this, arguments);
    if (!this.options.authModel) {
        throw new Error("authModel option is required");
    }
    this.app.use(passport.initialize());
    this.app.use(passport.session());


    passport.use(this.options.strategy || new LocalStrategy(
        function (username, password, done) {
            this.options.authModel.findOne({username:username, password:password}, done)
        }.bind(this)
    ));
    passport.serializeUser(function (user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function (id, done) {
        this.options.authModel.findOne({_id:id}, function (err, user) {
            done(err, user);
        });
    }.bind(this));
}
util.inherits(PassportPlugin, PluginApi);

module.exports = PassportPlugin;

PassportPlugin.prototype.ensureAuthenticated = function (req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated())
        return  next();
    res.send({status:1, message:'Not Authenticated'})
}
PassportPlugin.prototype.encryptCredentials = function (req, res, next) {
    var passfield = this.options.passwordField || 'password';
    if (!(passfield in req.body))
        return next();

    var hash = this.options.hash || 'sha1';
    var digest = this.options.digest || 'base64';
    var passHash = crypto.createHash(hash).update(req.body[passfield]).digest(digest);
    req.body[passfield] = passHash;
    next();
};
PassportPlugin.prototype.onAuth = function(req,res){
    res.send({
        status:0,
        payload:req.user
    });
}
PassportPlugin.prototype.filters = function () {
    var app = this.app;
    app.post(this.pluginUrl, this.encryptCredentials.bind(this),
        passport.authenticate('local', { failureRedirect:'/check' }), this.onAuth.bind(this));

    app.get(this.pluginUrl + '/check', this.ensureAuthenticated.bind(this), this.onAuth.bind(this));

    app.get(this.pluginUrl + '/logout', function (req, res) {
        req.logOut();
        res.redirect(this.baseUrl);
    }.bind(this));

    [this.baseUrl + '/rest/*'].concat(this.options.restrict).forEach(function (v) {
        if (v)
            this.app.all(v, this.ensureAuthenticated.bind(this));
    }, this);
    PluginApi.prototype.filters.apply(this, arguments);
}