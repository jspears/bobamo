var bobamo = require('../../index'), PluginApi = bobamo.PluginApi, mongoose = bobamo.mongoose,
    util = require('util'), _u = require('underscore'), passport = require('passport'), crypto = require('crypto'), Model = require('../../lib/display-model');

var defaultConf = {
    usernameField: 'username',
    passwordField: 'password',
    idField: '_id',
    strategy: 'passport-local',
    hash: 'sha1'
};
var PassportPlugin = function () {
    PluginApi.apply(this, arguments);
    this._install;
    this.conf = defaultConf;
    if (this.options.authModel) this.conf.authModel = this.options.authModel.modelName;
    this.app.use(passport.initialize());
    this.app.use(passport.session());

    this._appModel = {  header: {

        'admin-menu': {
            'passport': {
                label: 'Configure Passport',
                href: '#views/configure/passport'
            }
        }
    }};
}
util.inherits(PassportPlugin, PluginApi);
/**
 * Password is encrypted;
 * @param username
 * @param password
 * @param done
 * @returns {*}
 */
PassportPlugin.prototype.findByUsernamePassword = function (username, password, done) {
    var obj = {};
    obj[this.conf.usernameField] = username;
    obj[this.conf.passwordField] = password;
    var u = _.first(_.where(this.conf.users, {username: username, _password: password }));
    if (u) {
        u._id = u.username;
        return done(null, u);
    }
    if (this.conf.authModel) {
        mongoose.model(this.conf.authModel).findOne(obj, function (err, u) {
            console.log('err', err, 'found', obj, u != null);
            done(err, u);
        });
    } else {
        return done(null, null);
    }
}
PassportPlugin.prototype.findById = function (id, done) {
    var u = _.first(_.where(this.conf.users, {username: id}));
    if (u)
        return done(null, u);
    if (this.conf.authModel) {
        var obj = {};
        obj[this.conf.idField] = id;
        mongoose.model(this.conf.authModel).findOne(obj, function (err, u) {
            console.log('err', err, 'found', obj, u != null);

            done(err, u);
        });
    } else {
        done(null)
    }
}

PassportPlugin.prototype.identify = function (user, done) {
    done(null, user[this.conf.idField]);
}
PassportPlugin.prototype.registerSave = function () {
    var conf = this.conf;
    var doEncrypt = this.doEncrypt.bind(this);
    if (conf.authModel)
    bobamo.ready.promise.then(function () {
        mongoose.model(conf.authModel).schema.pre('save', function (next) {
            var password = this._doc[conf.passwordField];
            if (password && password !== 'password') {
                this[conf.passwordField] = doEncrypt(password)
            }
            next();
        });
    })
}

PassportPlugin.prototype.install = function (strategy) {
    if (this._install && this._install !== strategy) {
        console.error('changing strategy this requires a restart\n');
    }
    if (this._install)
        return;
    strategy = strategy || 'passport-local';
    var Strategy;
    try {
        Strategy = require(strategy).Strategy;
    } catch (e) {
        var error = {strategy: 'Strategy could not be installed ' + strategy + ' run\n npm ' + strategy };
        return error;
    }
    this._install = strategy;
    try {

        passport.use(strategy, new Strategy(this.findByUsernamePassword.bind(this)));
        passport.serializeUser(this.identify.bind(this));
        passport.deserializeUser(this.findById.bind(this));
        this.registerSave();
    } catch (e) {
        console.warn('caught error', e);
        return {errors: [e.message]}
    }

}

PassportPlugin.prototype.configure = function (options) {
    options = _u.extend({}, defaultConf, options);
    if (!(options.users || options.authModel))
        return {
            users: {
                message: 'Need at least one user'
            }
        }
    _.each(options.users, function (u) {
        if (u.password)
            u._password = this.doEncrypt(u.password, options.hash, options.digest);
        delete u.password;
    }, this);
    _u.each(['usernameField', 'passwordField', 'idField', 'authModel', 'hash', 'digest', 'authModel', 'strategy', 'users'], function (k) {
        this[k] = options[k]
    }, this.conf);
    return this.install(options.strategy);

}

PassportPlugin.prototype.appModel = function () {
    return  this._appModel;
}
PassportPlugin.prototype.admin = function () {
    return new Model('passport', [
        {
            schema: {
                usernameField: {
                    type: 'Text',
                    placeholder: this.usernameField || 'username',
                    validators: [
                        {type: 'required'}
                    ],
                    help: 'The Field in the model to use as the unique identifier'
                },
                passwordField: {
                    type: 'Text',
                    placeholder: this.passwordField || 'password',
                    validators: [
                        {type: 'required'}
                    ],
                    help: 'The field to use as a the password'
                },
                hash: {
                    type: 'Select',
                    options: ['sha1', 'md5', 'sha256', 'sha512', 'none'],
                    help: 'Encode the hashed passsword (none) is not recommended'
                },
                encoding: {
                    type: 'Select',
                    options: ['base64', 'hex'],
                    help: 'Encoding of the password base64 works just fine'
                },
                authModel: {
                    type: 'Select',
                    single: true,
                    collection: 'views/modeleditor/admin/schema-collection',
                    help: 'Which Schema to use as the user model'
                },
                users: {
                    type: 'List',
                    itemType: 'Object',
                    help: 'You can add users to your bobamo.json here in case the backing store is unavailable',
                    subSchema: {
                        username: { type: 'Text', title: 'username'},
                        password: { type: 'Password', title: 'password'}
                    }
                }
            },
            url: this.pluginUrl + '/admin/configure',
            fieldsets: [
                {legend: "Passport Plugin", fields: ['usernameField', 'passwordField', 'hash', 'encoding', 'authModel', 'users']}
            ],
            defaults: this.conf, //_u.extend({model:this.options.authModel.modelName}, this.config),
            plural: 'Passport',
            title: 'Passport Plugin',
            modelName: 'passport'
        }
    ]);

}

PassportPlugin.prototype.ensureAuthenticated = function (req, res, next) {
//    next();
//    passport.authorize('local', { failureRedirect: '/check' })(req,res,next)
//    next();
    if (req.isAuthenticated && req.isAuthenticated())
        return  next();
    res.send({status: 1, message: 'Not Authenticated'})
}
PassportPlugin.prototype.doEncrypt = function (password, hash, digest) {
    hash = hash || this.conf.hash || 'sha1';
    digest = digest || this.conf.digest || 'base64';
    return crypto.createHash(hash).update(password, 'utf8').digest(digest);
}
PassportPlugin.prototype.encryptCredentials = function (req, res, next) {
    var passfield = this.options.passwordField || 'password';
    if (!(passfield in req.body))
        return next();

    req.body[passfield] = this.doEncrypt(req.body[passfield]);
    next();
};
PassportPlugin.prototype.onAuth = function (req, res) {
    res.send({
        status: 0,
        payload: req.user
    });
}
PassportPlugin.prototype.logOut = function (req, res, next) {
    req.logOut();
    res.redirect(this.baseUrl);
}

PassportPlugin.prototype.filters = function () {
    var app = this.app;
    var username = this.usernameField;
    var appModel = this.pluginManager.appModel;
    app.get(this.baseUrl + '*', function (req, res, next) {
        res.locals('appModel', this.pluginManager.appModel)
        res.locals('user', req.user);
        var u = req.user;
        var obj = (u) ?
            {
                label: u[username],
                iconCls: 'icon-user',
                items: [

                    {
                        label: 'Edit Profile',
                        href: '#/' + this.conf.authModel + '/edit?id=' + u._id
                    },
                    {
                        label: 'Change Password',
                        iconCls: 'icon-lock',
                        href: '#/passport/change_password'
                    },
                    {
                        clsNames: 'divider'
                    },
                    {
                        label: 'Logout',
                        href: '/logout'
                    }
                ]
            }
                :
            {
                label: 'Login',
                href: '#/login'
            }
            ;

        next();
    }.bind(this)
    )
    ;

    app.post(this.pluginUrl, this.authenticate.bind(this), this.ensureAuthenticated.bind(this), this.onAuth.bind(this));

    app.get(this.pluginUrl + '/check', this.ensureAuthenticated.bind(this), this.onAuth.bind(this));

    app.get(this.baseUrl + 'logout', this.logOut.bind(this));

    app.post(this.baseUrl + '*', function (req, res, next) {
        if (req.authrequired) {
            return this.authenticate(req, res, next);
        }
        next();
    }.bind(this), function (req, res, next) {
        if (req.authrequired)
            return  this.ensureAuthenticated(req, res, next)
        return next();
    }.bind(this));

//    [this.baseUrl + '/rest/*'].concat(this.options.restrict).forEach(function (v) {
//        if (v)
//            this.app.all(v, this.ensureAuthenticated.bind(this));
//    }, this);
    PluginApi.prototype.filters.apply(this, arguments);
}
var hasLength = function (str) {
    for (var i = 0, l = arguments.length; i < l; i++) {
        if (!(arguments[i] && str.trim().length > 0))
            return false;
    }
    return true;
}


PassportPlugin.prototype.routes = function () {

    this.app.get(this.baseUrl + 'js/views/header.js', function (req, res, next) {
        this.generate(res, 'header.js', {}, next);
    }.bind(this));
    this.app.post(this.pluginUrl + '/change_password', function (req, res, next) {
        var body = req.body;
        if (!req.user) {
            return res.send({
                status: 1,
                error: 'Not Logged In'

            })
        }
        var passwordField = this.conf.passwordField, usernameField = this.conf.usernameField;

        if (hasLength(body.password, body.confirm_password, body.new_password)) {
            if (body.new_password !== body.confirm_password) {
                return res.send({
                    status: 0,
                    error: {
                        new_password: 'Password does not match'
                    }
                });
            }
            this.findByUsernamePassword(req.user[usernameField], this.doEncrypt(body.password), function (e, o) {
                if (e) return next(e);
                if (!o)
                    return res.send({
                        status: 1,
                        error: {
                            errors: {password: 'Incorrect Password'}
                        }
                    });
                o[passwordField] = body.new_password;
                o.save(function (oe, no) {
                    if (oe) return next(oe);
                    req.user = no;
                    res.send({
                        status: 0,
                        payload: {
                            _id: req.user[usernameField],
                            message: 'Password Changed Successfully'
                        }
                    })
                });

            })


        }


    }.bind(this)
    );
    PluginApi.prototype.routes.apply(this, arguments);
}
PassportPlugin.prototype.authenticate = function (req, res, next) {
    var passfield = this.conf.passwordField || 'password';
    var authenticate = passport.authenticate(this._install, { failureRedirect: this.pluginUrl + '/check' });
    if (req.body[passfield]) {
        this.encryptCredentials(req, res, function (err) {
            if (err) return next(err);
            return authenticate(req, res, next);
        })
    } else {
        next();
    }
}
module.exports = PassportPlugin;
