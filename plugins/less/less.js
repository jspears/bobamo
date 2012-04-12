var Plugin = require('../../lib/plugin-api'), path = require('path'), _u = require('underscore'), sutil = require('util'), LessFactory = require('./less-factory');
var LessPlugin = function (options, app, name) {
    Plugin.apply(this, arguments);
    var dirPath = path.join(this.path, 'less');
    if (!this.options.lessFactory)
        this.lessFactory = this.options.lessFactory = new LessFactory({
            paths:[dirPath]
        });
    this._variables = {};

}
sutil.inherits(LessPlugin, Plugin);
LessPlugin.prototype.configure = function (conf) {
    _u.extend(this._variables, conf);
}

LessPlugin.prototype.admin = function () {
    return {
        href:'#/less/admin/display',
        title:'Display Settings'
    };
}
LessPlugin.prototype.editors = function () {
    return ['ColorEditor', 'UnitEditor', 'PlaceholderEditor'];
}

LessPlugin.prototype.filters = function () {
    this.app.get(this.baseUrl + '*', function (req, res, next) {
        res.local('lessFactory', this.lessFactory);
        next();
    }.bind(this));
    Plugin.prototype.filters.apply(this, arguments);
}

LessPlugin.prototype.routes = function () {
    var base = this.pluginUrl;
    var lessFactory = this.lessFactory;
    var app = this.app;
    app.get(base + '/:id?', function (req, res, next) {
        res.contentType('text/css');
        lessFactory.current(function onCss(err, obj) {
            if (err) return next(err);
            res.send(obj.payload);
        }, req.params.id);
    });
    app.get(base + '/admin/:id?', function (req, res, next) {
        var obj = _u.extend({}, lessFactory.getCache(req.params.id || req.body.id) || this._variables);
        delete obj.payload;

        res.send({
            status:0,
            payload:obj.variables
        })

    });
    app.post(base + '/admin', function (req, res, next) {
        delete req.body.variables;
        delete req.body.created;
        delete req.body.payload;
        var install = req.body.install;
        delete req.body.install;

        lessFactory.createCache(function (err, obj) {
            if (err)
                return next(err);
            var payload = _u.extend({}, obj);
            if (install)
                lessFactory.checksum = obj.id;

            this.save(payload, function (err, resp) {
                if (err)
                    return next(err);
                res.send({
                    status:0,
                    payload:payload
                });

            })
        }.bind(this), req.body);
    });

    app.put(base + '/admin/:id?', function (req, res, next) {
        delete req.body.variables;
        delete req.body.created;
        delete req.body.payload;
        var id = req.body.id || req.params.id;
        var install = req.body.install;
        lessFactory.createCache(function (err, obj) {
            if (err)
                return next(err);
            var payload = _u.extend({}, obj);

            if (install)
                lessFactory.checksum = obj.id;
            this.save(payload, function (err, resp) {
                if (err)
                    return next(err);
                res.send({
                    status:0,
                    payload:payload
                });

            })
        }.bind(this), req.body);
    });

    Plugin.prototype.routes.call(this);
}

module.exports = LessPlugin;