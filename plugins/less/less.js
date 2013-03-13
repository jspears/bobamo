var Plugin = require('../../lib/plugin-api'), path = require('path'), _u = require('underscore'),
    sutil = require('util'), LessFactory = require('./less-factory');
var LessPlugin = function (options, app, name) {
    Plugin.apply(this, arguments);

    this._variables = {};

}
sutil.inherits(LessPlugin, Plugin);
LessPlugin.prototype.configure = function (conf) {
    _u.extend(this._variables, conf);
    var paths = [ path.join(this.path, 'less')];
    _u.each(this.pluginManager.plugins, function(v){
        if (v !== this)
            paths.push(path.join(v.path, 'less'));
    }, this);
    paths.push(process.cwd()+'/less')
    if (!this.options.lessFactory)
        this.lessFactory = this.options.lessFactory = new LessFactory({
            paths:paths
        });
}

LessPlugin.prototype.appModel = function () {
    return {
        modelPaths:{},
        header:{
            'admin-menu':{

                'less':{
                    href:'#/less/views/admin/display',
                    label:'Display Settings'
                }
            }
        }
    }
}
LessPlugin.prototype.editors = function () {
    return [
        {
            name:'ColorEditor',
            types:['String'],
            schema:{
                placeholder:{ type:'ColorEditor' }

            }
        },
        {
            name:'UnitEditor',
            types:['String'],
            schema:{
                defaultValue:{ type:'Select', options:['px', '%', 'em', 'in', 'cm', 'mm', 'ex', 'pt', 'pc', 'px', '\u0192'] }

            }
        }
    ];
}

LessPlugin.prototype.filters = function () {
    this.app.get(this.baseUrl + '*', function (req, res, next) {
        if (_u.isFunction(res.local)) {
            res.local('lessFactory', this.lessFactory);
        } else {
            res.locals['lessFactory'] = this.lessFactory;
        }
        next();
    }.bind(this));
    Plugin.prototype.filters.apply(this, arguments);
}

LessPlugin.prototype.routes = function () {
    var base = this.pluginUrl;
    var app = this.app;
    app.get(base + '/:id?', function (req, res, next) {
        res.contentType('text/css');
        this.lessFactory.current(function onCss(err, obj) {
            if (err) return next(err);
            res.send(obj.payload);
        }, req.params.id);
    }.bind(this));
    app.get(base + '/admin/:id?', function (req, res, next) {
        var obj = _u.extend({}, this.lessFactory.getCache(req.params.id || req.body.id) || this._variables);
        delete obj.payload;

        res.send({
            status:0,
            payload:obj.variables
        })

    }.bind(this));
    app.post(base + '/admin', function (req, res, next) {
        delete req.body.variables;
        delete req.body.created;
        delete req.body.payload;
        var install = req.body.install;
        delete req.body.install;
        var pm = this.pluginManager;
        this.lessFactory.createCache(function (err, obj) {
            if (err)
                return next(err);
            var payload = _u.extend({}, obj);
            if (install)
                this.lessFactory.checksum = obj.id;

            this.save(payload, function (err, resp) {
                if (err)
                    return next(err);
                res.send({
                    status:0,
                    payload:payload
                });

            })
        }.bind(this), req.body);
    }.bind(this));

    app.put(base + '/admin/:id?', function (req, res, next) {
        delete req.body.variables;
        delete req.body.created;
        delete req.body.payload;
        var id = req.body.id || req.params.id;
        var install = req.body.install;
        var pm = this.pluginManager;

        this.lessFactory.createCache(function (err, obj) {
            if (err)
                return next(err);
            var payload = _u.extend({}, obj);

            if (install)
                this.lessFactory.checksum = obj.id;
            this.save(payload, function (err, resp) {
                if (err)
                    return next(err);
                res.send({
                    status:0,
                    payload:payload
                });

            })
        }.bind(this), req.body);
    }.bind(this));

    Plugin.prototype.routes.call(this);
}

module.exports = LessPlugin;