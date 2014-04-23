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
        var token = req.body.token || req.session.setupToken;
        var options = {
            appModel: pm.appModel,
            plugin: this
        };

        if (pm.setupToken && token == pm.setupToken) {
            console.log('valid token');
            if (req.method == "POST") {
                req.session.setupToken = pm.setupToken;
                delete req.session.errors;
                return res.redirect(this.baseUrl + 'index.html');
            } else {
                return this.generate(res, 'setup.html', options);
            }
        } else {
            console.log('invalid token', token);
            if (token)
                req.session.errors = 'Invalid Token'
            if (req.method !== 'GET')
                return res.redirect(this.baseUrl + 'index.html');
            return this.generate(res, 'token.html', options)
        }

    }.bind(this);

    this.app.get(baseUrl + 'index.html', setup);
    this.app.post(baseUrl + 'index.html', setup);
    var protect = function (req, res, next) {
        if (!(pm.reconfigure && pm.reconfigure.length))
            return next();
        var token = req.body.token || req.session.setupToken;
        if (pm.setupToken && token != pm.setupToken)
            res.send(403, 'Invalid token sent in setup mode');
        return next();
    }.bind(this);
    this.app.post(this.baseUrl + '*', protect);
    this.app.del(this.baseUrl + '*', protect);
    this.app.put(this.baseUrl + '*', protect);
//    this.app.post(baseUrl + 'setup.html', setup);
//    this.app.get(baseUrl + 'setup.html', setup);
    PluginApi.prototype.filters.apply(this, arguments);
}
//SetupPlugin.prototype.routes = function () {
//    this.app.get(this.baseUrl + ':view.:format', function (req, res, next) {
//        this.generate(res, '/views/setup.' + req.params.format, next);
//    }.bind(this));
//    PluginApi.prototype.routes.apply(this, arguments);
//}

SetupPlugin.prototype._configure = function (conf) {
    var sconf =this.conf = {};
    var self = this;
    var pm = this.pluginManager;
    return Q.allSettled(pm.reconfigure.map(function (k) {
        var plugin = this[k];
        if (self === plugin)
             return;

        return Q.when(plugin.configure(conf[k])).then(function () {
            console.log('configured', k);
            sconf[k] = plugin.conf;
        }, function (v) {
            return v;
        });
    }, pm.loadedPlugins)).then(function(promises){
        var errors = [];
        promises.forEach(function(promise){
            var value = promise.valueOf();
            if (value != null){
                errors.push(value);
            }
        })
        return errors.length ? errors : null;
     });

}
SetupPlugin.prototype.save = function (conf, callback) {
    var pm = this.pluginManager, persist = pm.persist;
    var osave =persist.save;
    var nconf = {};
    persist.save = function (name, conf, cb) {
        //capture any changes done to the date before save.
        nconf[name] = conf;
        cb(null, null);
    }
    Q.allSettled(pm.reconfigure.map(function(k){
        var d= Q.defer();
            //pass in the conf, get out the new conf
        this[k].save(conf[k], d.makeNodeResolver());
        return d.promise;
    }, pm.loadedPlugins)).then(function(){
            persist.save = osave;
            pm.reconfigure = [];
            delete pm.setupToken;
            persist.saveAll(nconf, callback);
    });
}

module.exports = SetupPlugin;
