var bobamo = require('../../index'), Plugin = bobamo.PluginApi, Q = bobamo.Q, path = require('path'), _u = require('underscore'),
    sutil = require('util'), LessFactory = require('./less-factory'), fs = require('fs');
var LessPlugin = function (options, app, name) {
    Plugin.apply(this, arguments);

    this.conf = {};

}
sutil.inherits(LessPlugin, Plugin);
LessPlugin.prototype.paths = function(){
    var paths = [ path.join(this.path, 'less')];
    this.pluginManager.forEach(function (plugin) {
        if (plugin !== this)
            paths.push(path.join(plugin.path, 'less'));
    }, this);
    paths.push(process.cwd() + '/less')
    return paths

}
LessPlugin.prototype.configure = function (conf) {
    Plugin.prototype.configure.call(this, conf && conf.variables || conf || {});
    var paths = this.paths();
    if (!this.options.lessFactory)
        this.lessFactory = this.options.lessFactory = new LessFactory({
            paths: paths
        });
    var created = conf && conf.created;
    if (this.conf.created) {

        if (paths.filter(function (path) {
            try {
                var stat = fs.statSync(path);
                return stat.mtime && stat.mtime.getTime() < created;
            } catch (e) {
                //console.log('less: error stating',path, e.message);
            }
        }).shift()) {
            return;
        }
    }
    var d = Q.defer();
    console.log('creating css cache');
    try {
    this.lessFactory.createCache(function (e, o) {
        if (e) {
            console.log('less: error creating cache', JSON.stringify(e, null, 3));
            return d.resolve(e);
        }
        this.lessFactory.checksum = o.id;
         return d.resolve(null);
    }.bind(this), {paths: paths, variables: this.conf.variables}, true);
    }catch(e){
        console.log('error',e);
    }
        return d.promise;
}


LessPlugin.prototype.editors = function () {
    return [
        {
            name: 'ColorEditor',
            types: ['String'],
            schema: {
                placeholder: { type: 'ColorEditor' }

            }
        },
        {
            name: 'UnitEditor',
            types: ['String'],
            schema: {
                defaultValue: { type: 'Select', options: ['px', '%', 'em', 'in', 'cm', 'mm', 'ex', 'pt', 'pc', 'px', '\u0192'] }

            }
        }
    ];
}
LessPlugin.prototype.appModel = function () {
    return {
        header: {
            'admin-menu': {

                'less': {
                    href: '#less/views/admin/configure/less',
                    label: 'Display Settings'
                }
            }
        }
    }
}

LessPlugin.prototype.filters = function () {
    this.app.get(this.baseUrl + '*', function (req, res, next) {
        res.locals.lessFactory = this.lessFactory;
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
        var obj = _u.extend({}, this.lessFactory.getCache(req.params.id || req.body.id) || this.conf);
        delete obj.payload;

        res.send({
            status: 0,
            payload: obj.variables
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
            if (install){
                this.lessFactory.checksum = obj.id;
                obj.paths = obj.variables.paths;
                delete obj.variables.imports;
                delete obj.variables.paths;//keep paths so we can do better cache checking.

                _.extend(this.conf, obj);
            this.save(payload, function (err, resp) {
                if (err)
                    return next(err);
                res.send({
                    status: 0,
                    payload: payload
                });
            })
            }else{
                res.send(
                    {
                        status:0,
                        payload:payload
                    }
                )
            }
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
                    status: 0,
                    payload: payload
                });

            })
        }.bind(this), req.body);
    }.bind(this));

    Plugin.prototype.routes.call(this);
}

module.exports = LessPlugin;