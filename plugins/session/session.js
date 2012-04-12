var PluginApi = require('../../index').PluginApi, util = require('util'), crypto = require('crypto');
var SessionPersistence = function (orig) {
    this.orig = orig;
}

SessionPersistence.prototype.save = function (key, data, callback) {
        if (this.session) {
        var conf = (this.session.conf || (this.session.conf = {plugins:{}})).plugins[key] = data;

        var conf_str = JSON.stringify(conf);
        var sha = crypto.createHash('sha1').update(conf_str).digest('base64');

        callback(null, {_id:sha, timestamp:Date.now()});
    }else{
        callback(null,null);
    }

}
SessionPersistence.prototype.list = function (callback) {
    if (this.orig)
        return this.orig.list(callback);
}

SessionPersistence.prototype.read = function (filename) {
    if (this.session) {
        return this.session.conf;
    }else{
        if (this.orig)
            return this.orig.read(filename);
    }
}

var SessionPlugin = function () {
    PluginApi.apply(this, arguments);
    var persist = this.persist = this.pluginManager.persist = new SessionPersistence(this.pluginManager.persist);

    this._appModel = {};

    ['title', 'version', 'description', 'modelPaths'].forEach(function (v) {
        this._appModel.__defineGetter__(v, function () {
            var conf = persist.read();
            if (conf && v in conf)
                return conf[v];
            return
        });
    }, this)
}

util.inherits(SessionPlugin, PluginApi);
module.exports = SessionPlugin;

SessionPlugin.prototype.appModel = function () {
    return this._appModel;
}

SessionPlugin.prototype.filters = function () {
    this.app.all(this.baseUrl + '*', function (req, res, next) {
        this.persist.session = req.session;
        next();
    }.bind(this));
};

