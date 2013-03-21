var bobamo = require('../../index'),
    Q = require('q'),
    PluginApi = bobamo.PluginApi, util = require('util');

var SetupPlugin = function () {
    PluginApi.apply(this, arguments);
}
util.inherits(SetupPlugin, PluginApi);

SetupPlugin.prototype.filters = function () {
    var pm = this.pluginManager;
    var baseUrl = this.baseUrl;
    var setup = function (req, res, next) {
        if (!(pm.reconfigure && pm.reconfigure.length))
            return next();
        var token = req.body.token || req.cookies['token'];
        var options = {
                appModel:pm.appModel,
                plugin:this
            } ;
        if (pm.setupToken && token == pm.setupToken) {
            console.log('valid token');
            if (req.method == "POST"){
                res.cookie('token', pm.setupToken);
                return res.redirect(this.baseUrl+ 'index.html');
            }else{
                return this.generate(res, 'setup.html', options);
            }
        } else {
            console.log('invalid token', token);
            if (token)
                options.error = 'Invalid Token'
            res.cookie('token','');
            return this.generate(res, 'token.html', options)
        }

    }.bind(this);

    this.app.get(baseUrl + 'index.html', setup);
    this.app.post(baseUrl + 'index.html', setup);
    var protect = function (req,res,next){
        if (!(pm.reconfigure && pm.reconfigure.length))
            return next();
        var token = req.body.token || req.cookies['token'];
        if (token != pm.setupToken)
            res.send(403, 'Invalid token sent in setup mode');
    }.bind(this);
    this.app.post(this.baseUrl+'*', protect);
    this.app.del(this.baseUrl+'*', protect);
    this.app.put(this.baseUrl+'*', protect);
//    this.app.post(baseUrl + 'setup.html', setup);
//    this.app.get(baseUrl + 'setup.html', setup);
    PluginApi.prototype.filters.apply(this, arguments);
}
function nodevoker(ctx, method, args) {
    args = Array.prototype.slice.call(arguments, 2);
    method = _.isFunction(method) ? method : ctx[method];
    var d = Q.defer();
    args.push(function onNodevoke(e, o) {
        if (e)
            return d.reject(e);
        d.resolve(o);
    })
    method.apply(ctx, args)
    return d.promise;
}
SetupPlugin.prototype.save = function (conf, cb) {
    var reconfigured = this.pluginManager.reconfigure || [];
    var results = Object.keys(conf).map(function (k) {
        return nodevoker(this[k], 'configure', conf[k]);
    }, this.pluginManager.loadedPlugins);
    Q.allResolved(results).done(function (a) {
        console.log("finally", a);
        Q.allResolved(_.map(a, function onConf(promise) {
                var plugin = promise.valueOf();
                if (promise.isFulfilled()) {
                    return nodevoker(plugin, 'save', conf[plugin.name]);
                }
                return plugin.valueOf().exception;
            })).then(function (a) {
                console.log("saved", a);
                var errors = [];
                _.each(a, function (promise) {
                    var plugin = promise.valueOf();
                    if (promise.isFulfilled()) {
                        var idx = reconfigured.indexOf(plugin.name);
                        if (~idx)
                            reconfigured.splice(idx, 1)
                    } else {
                        errors.push(plugin.exception.message);
                    }
                });
                cb(errors.length ? errors : null, reconfigured)

            });
    }, function (a) {
        console.log("failed", a);
    })
}
SetupPlugin.prototype.routes = function () {
    this.app.get(this.baseUrl + ':view.:format', function (req, res, next) {
        this.generate(res, '/views/setup.' + req.params.format, next);
    }.bind(this));
    PluginApi.prototype.routes.apply(this, arguments);
}

module.exports = SetupPlugin;
