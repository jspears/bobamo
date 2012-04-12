var PluginApi = require('../../index').PluginApi, util = require('util'), crypto = require('crypto'), _u = require('underscore');
var SessionPersistence = function (orig) {
    this.orig = orig;
}

SessionPersistence.prototype.save = function (key, data, callback) {
    if (this.session) {
        var conf = (this.session.conf || (this.session.conf = {plugins:{}})).plugins[key] = data;
        (this.session.conf .keys || (this.session.conf .keys = {}))[key] = true;

        var conf_str = JSON.stringify(conf);
        var sha = crypto.createHash('sha1').update(conf_str).digest('base64');

        callback(null, {_id:sha, timestamp:Date.now()});
    } else {
        callback(null, null);
    }

}
SessionPersistence.prototype.list = function (callback) {
    if (this.orig)
        return this.orig.list(callback);
}

SessionPersistence.prototype.read = function (filename) {
    if (this.session) {
        return this.session.conf;
    } else {
        if (this.orig)
            return this.orig.read(filename);
    }
}

var SessionModel = function (persist) {
    ['title', 'version', 'description', 'modelPaths'].forEach(function (v) {
        this.__defineGetter__(v, function () {
            var conf = persist.read();

            if (conf && conf.plugins){
                var plugins = conf.plugins;
                var keys = Object.keys(conf.keys);
                for(var i=0,l=keys.length; i<l;i++){
                    var name = keys[i];
                    if (!(_u.isUndefined(plugins[name])|| (_u.isUndefined(plugins[name][v])))){
                        var ret = plugins[name][v];
                        return ret;
                    }
                }
            }

        });
    }, this)

}
var SessionPlugin = function () {
    PluginApi.apply(this, arguments);
    var persist = this.persist = this.pluginManager.persist = new SessionPersistence(this.pluginManager.persist);

    this._appModel = new SessionModel(persist);

}

util.inherits(SessionPlugin, PluginApi);
module.exports = SessionPlugin;

SessionPlugin.prototype.appModel = function () {
    return this._appModel;
}

SessionPlugin.prototype.filters = function () {
    this.app.all(this.baseUrl + '*', function (req, res, next) {
        console.log('setting session');
        this.persist.session = req.session;
        next();
    }.bind(this));
};

