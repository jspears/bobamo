var Plugin = require('../../lib/plugin-api'), util = require('util'), _u = require('underscore'), butil = require('../../lib/util'), schemaUtil = require('../../lib/schema-util'), inflection = require('../../lib/inflection');

var GeneratorPlugin = function (options) {
    Plugin.apply(this, arguments);
    this.pluginUrl = this.baseUrl;
}

util.inherits(GeneratorPlugin, Plugin);

module.exports = GeneratorPlugin;

GeneratorPlugin.prototype.filters = function (options) {
    var apiPath = this.options.apiUri || this.baseUrl + 'rest';
    this.app.get(this.baseUrl + '*', function (req, res, next) {
        var useAuth = req.isAuthenticated ? true : false;
        var locals = {
            'useAuthentication': useAuth,
            'isAuthenticated': useAuth ? req.isAuthenticated() : false,
            'api': apiPath,
            'baseUrl': this.baseUrl,
            'params': req.params,
            'query': req.query,
            'appModel': this.pluginManager.appModel,
            'pluginManager': this.pluginManager,
            'options': options
        };
        if (_u.isFunction(res.local)) {
            _u.each(locals, function (v, k) {
                res.local(k, v);
            })
        } else {
            _u.extend(res.locals, locals);
        }
        next();
    }.bind(this));

}

var Items = function (appModel, pluginManager) {

    this.__defineGetter__('title-bar', function onItemTitleBarGetter() {
        var items = {};
        var paths = appModel.modelPaths;
        _u.each(appModel.modelPaths, function (l, k) {
            var finders = l.finders && l.finders.length && l.finders;
            var id = ['title-bar', k].join('_')
            var itm = items[k] = {
                label: l.plural,
                id: id

            }

            if (l.finders && l.finders.length) {
                var f = (itm.items = []);
                _u.each(l.finders, function (j, kk) {
                    var href = ['#/views', k, 'finder', j.name].join('/');
                    f.push({ id: [id, 'finder', j.name].join('_'), href: href, label: j.title});
                });
                f.push({
                    id: [id, 'all'].join('_'), href: ['#/views', k, 'list'].join('/'), label: 'All ' + l.plural
                })
            } else {
                itm.href = ['#/views', k, 'list'].join('/');
            }
        })
        return items;
    });
    this.__defineGetter__('user-menu', function () {

        return
    });
    this.__defineGetter__('admin-menu', function () {
        var menu = {};
        pluginManager.forEach(function (plugin) {
            if (plugin.name == 'generator')
                return;
            var appModel = plugin.appModel();
            if (appModel && appModel.header && appModel.header['admin-menu'])
                return;
            var m = plugin.admin();
            if (m) {
                if (Array.isArray(m)) {
                    console.log('multiple admin modules not supported yet');
                    m = m[0];
                    _.each(m, function (v) {
                        menu[plugin.name + '-admin-' + v.modelName] = {
                            label: v.title || 'Configure ' + m.title,
                            href: v.href || '#views/configure/' + plugin.name + '/' + v.modelName,
                            iconCls: v.iconCls
                        }
                    });
                } else {
                    menu[plugin.name + '-admin'] = {
                        label: 'Configure ' + m.title,
                        href: '#views/configure/' + plugin.name
                    }
                }
            }
        })
        return menu;
    });

}
GeneratorPlugin.prototype.appModel = function () {

    return {
        header: new Items(this.pluginManager.appModel, this.pluginManager)
    }

}
var extRe = /\.(js|html|css|htm)$/i;
GeneratorPlugin.prototype.routes = function (options) {
    var appModel = this.pluginManager.appModel;

    var baseOpts = {
//        includes:function (arr) {
//            var data = this;
//            arr = arr || [];
//            arr = _u.map(arr, function (v) {
//                return  _u.template(v, data);
//            });
//            var includes = data.model.includes || [];
//
//            return JSON.stringify(arr.concat(includes));
//        },
//        includeSchema:function (schema) {
//            return schemaUtil.includes(schema)
//        }
    }

    function makeOptions(req, res) {
        var type = req.params.type || res.locals.type;
        var opts = _u.extend({modelName: type}, baseOpts);
        var model = res.locals.model || type && appModel.modelFor(type);
        if (model) {
            type = type && type.replace(extRe, '');
            opts.model = model;
            opts.type = type;
            opts.view = res.locals.view || req.params.view;
            opts.urlRoot = model.modelName;
            opts.collection = model.modelName;
        }
        return opts;
    }

    function makePostOptions(req) {
        var type = req.params.type;
        var opts = _u.extend({modelName: type}, baseOpts);
        if (type) {
            type = type.replace(extRe, '');
            opts.model = req.body;
            opts.type = type;
            opts.view = req.params.view;
            opts.collection = type;
        }
        return opts;
    }

    var app = this.app;
    var base = this.baseUrl;
    if (this.options.index) {
        app.get(base + this.options.index, function (req, res, next) {
            this.generate(res, 'index.html', makeOptions(req, res), next);
        }.bind(this))
    }

    app.get(base, function (req, res, next) {
        res.redirect(this.baseUrl + (this.options.index || 'index.html'));
    }.bind(this));

    function finderOpts(req, res) {
        var options = makeOptions(req, res);
        var finder = options.model.finder(options.view);
        options = _u.extend(options, {
            urlRoot: options.type + '/finder/' + options.view,
            collection: req.params.type + '/finder/' + options.view,
            model: finder.model,
            finder: finder
        });
        return options;
    }

    var superUrl = function (req, res, next) {
        req.url = req.url.replace('/super/', '/');
        next();
    }
    _u.each(['js', 'tpl', 'templates'], function (v) {
        app.get(base + v + '/super/*', superUrl);
        app.post(base + v + '/super/*', superUrl);
    });

    app.get(base + 'js/appModel/:key?', function (req, res, next) {

        var model = butil.depth(this.pluginManager.appModel, req.params.key)
        res.send({
            status: 0,
            payload: model
        })
    }.bind(this));
    app.get(base + 'js/views/configure/:view.:format', function (req, res, next) {
        var plugin = this.pluginManager.loadedPlugins[req.params.view]
        var model = plugin.admin();

        this.generate(res, 'views/configure.js', _u.extend({
            plugin: plugin,
            model: plugin.admin()
        }, req.params), next);
    }.bind(this));
    app.get(base + 'js/views/configure-model/:view.:format', function (req, res, next) {
        var plugin = this.pluginManager.loadedPlugins[req.params.view]
        var model = plugin.admin();

        this.generate(res, 'views/configure-model.js', _u.extend({
            plugin: plugin,
            model: plugin.admin()
        }, req.params), next);
    }.bind(this));

    app.get(base + 'js/views/:type/finder/:view.:format', function (req, res, next) {
        this.generate(res, 'views/finder.' + req.params.format, finderOpts(req, res), next);
    }.bind(this));

    app.get(base + 'js/:clz/:type/finder/:view.:format', function (req, res, next) {

        this.generate(res, req.params.clz + '.' + req.params.format, finderOpts(req, res), next);
    }.bind(this));

    app.get(base + 'templates/:type/finder/:view/:tmpl', function (req, res, next) {
        this.generate(res, 'templates/' + req.params.tmpl, finderOpts(req, res), next);

    }.bind(this));

    app.get(base + ':view', function (req, res, next) {
        this.generate(res, req.params.view, makeOptions(req, res), next);
    }.bind(this));
    app.get(base + 'js/:view', function (req, res, next) {
        this.generate(res, req.params.view, makeOptions(req, res), next);
    }.bind(this));
    app.get(base + 'js/views/:view', function (req, res, next) {
        this.generate(res, req.params.view, makeOptions(req, res), next);
    }.bind(this));

    app.get(base + 'js/views/:type/:view', function (req, res, next) {
        this.generate(res, 'views/' + req.params.view, makeOptions(req, res), next);
    }.bind(this));

    app.get(base + 'js/:view/:type.:format', function (req, res, next) {
        this.generate(res, req.params.view + '.' + req.params.format, makeOptions(req, res), next);
    }.bind(this));

    app.get(base + 'js/:view', function (req, res, next) {
        this.generate(res, req.params.view, makeOptions(req, res), next);

    }.bind(this));
    app.get(base + 'templates/:type/:view', function (req, res, next) {
        this.generate(res, 'templates/' + req.params.view, makeOptions(req, res), next);

    }.bind(this));
    app.get(base + 'tpl/:view', function (req, res, next) {
        this.generate(res, 'templates/' + req.params.view, makeOptions(req, res), next);

    }.bind(this));
    //post instead of model
    app.post(base, function (req, res, next) {
        res.redirect(this.baseUrl + (this.options.index || 'index.html'));
    }.bind(this));

    app.post(base + 'js/views/:type/finder/:view.:format', function (req, res, next) {
        this.generate(res, 'views/finder.' + req.params.format, makePostOptions(req), next);
    }.bind(this));

    app.post(base + ':view', function (req, res, next) {
        this.generate(res, req.params.view, makePostOptions(req), next);
    }.bind(this));
    app.post(base + 'js/:view', function (req, res, next) {
        this.generate(res, req.params.view, makePostOptions(req), next);
    }.bind(this));
    app.post(base + 'js/views/:view', function (req, res, next) {
        this.generate(res, req.params.view, makePostOptions(req), next);
    }.bind(this));

    app.post(base + 'js/views/:type/:view', function (req, res, next) {
        this.generate(res, 'views/' + req.params.view, makePostOptions(req), next);
    }.bind(this));

    app.post(base + 'js/:view/:type.:format', function (req, res, next) {
        this.generate(res, req.params.view + '.' + req.params.format, makePostOptions(req), next);
    }.bind(this));

    app.post(base + 'templates/:type/:view', function (req, res, next) {
        this.generate(res, 'templates/' + req.params.view, makePostOptions(req), next);

    }.bind(this));
    app.post(base + 'tpl/:view', function (req, res, next) {
        this.generate(res, 'templates/' + req.params.view, makePostOptions(req), next);

    }.bind(this));
}
