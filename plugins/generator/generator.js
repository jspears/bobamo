var Plugin = require('../../lib/plugin-api'), util = require('util'), _u = require('underscore'), schemaUtil = require('../../lib/schema-util');

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
            'useAuthentication':useAuth,
            'isAuthenticated':useAuth ? req.isAuthenticated() : false,
            'api':apiPath,
            'baseUrl':this.baseUrl,
            'params':req.params,
            'query':req.query,
            'appModel':this.pluginManager.appModel,
            'pluginManager':this.pluginManager,
            'options':options
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
var extRe = /\.(js|html|css|htm)$/i;
GeneratorPlugin.prototype.routes = function (options) {
    var appModel = this.pluginManager.appModel;
    var baseOpts = {
        includes:function (arr) {
            var data = this.data;
            arr = arr || [];
            arr = _u.map(arr, function (v) {
                return  _u.template(v, data);
            });
            var includes = data.model.includes  || [];
            if (this.include)
                includes = includes.concat(this.include);
            return JSON.stringify(arr.concat(includes));
        }
    }

    function makeOptions(req) {
        var type = req.params.type;
        var opts = _u.extend({modelName:type}, baseOpts);

        if (type) {
            type = type.replace(extRe, '');
            opts.model = appModel.modelFor(type);
            opts.type = type;
            opts.view = req.params.view;
        }
        return opts;
    }

    function makePostOptions(req) {
        var type = req.params.type;
        var opts = _u.extend({modelName:type}, baseOpts);
        if (type) {
            type = type.replace(extRe, '');
            opts.model = req.body;
            opts.type = type;
            opts.view = req.params.view;
        }
        return opts;
    }

    var app = this.app;
    var base = this.baseUrl;
    if (this.options.index) {
        app.get(base + this.options.index, function (req, res, next) {
            this.generate(res, 'index.html', makeOptions(req), next);
        }.bind(this))
    }

    app.get(base, function (req, res, next) {
        res.redirect(this.baseUrl + (this.options.index || 'index.html'));
    }.bind(this));

    app.get(base + 'js/:super?/views/:type/finder/:view.:format', function (req, res, next) {
        var options = makeOptions(req);
        var finder = _u.first(_u.filter(options.model.finders, function(v,k){
            return options.view == v.name
        }))
        if (finder ){
            var includes = options.includes;
            var inc = schemaUtil.includes(finder.display.schema, finder.list_fields || finder.fields || null);
            options.includes = function(){
                var args =  _u.flatten([_u.toArray(arguments), inc])
                    return includes.call(this, args);
            }

        }
        this.generate(res, 'views/finder.' + req.params.format,options, next);
    }.bind(this));

    app.get(base + ':view', function (req, res, next) {
        this.generate(res, req.params.view, makeOptions(req), next);
    }.bind(this));
    app.get(base + 'js/:view', function (req, res, next) {
        this.generate(res, req.params.view, makeOptions(req), next);
    }.bind(this));
    app.get(base + 'js/:super?/views/:view', function (req, res, next) {
        this.generate(res, req.params.view, makeOptions(req), next);
    }.bind(this));

    app.get(base + 'js/:super?/views/:type/:view', function (req, res, next) {
        this.generate(res, 'views/' + req.params.view, makeOptions(req), next);
    }.bind(this));

    app.get(base + 'js/:super?/:view/:type.:format', function (req, res, next) {
        this.generate(res, req.params.view + '.' + req.params.format, makeOptions(req), next);
    }.bind(this));

    app.get(base + 'js/:super?/:view', function (req, res, next) {
        this.generate(res, req.params.view, makeOptions(req), next);

    }.bind(this));
    app.get(base + 'templates/:super?/:type/:view', function (req, res, next) {
        this.generate(res, 'templates/' + req.params.view, makeOptions(req), next);

    }.bind(this));
    app.get(base + 'tpl/:super?/:view', function (req, res, next) {
        this.generate(res, 'templates/' + req.params.view, makeOptions(req), next);

    }.bind(this));
    //post instead of model
    app.post(base, function (req, res, next) {
        res.redirect(this.baseUrl + (this.options.index || 'index.html'));
    }.bind(this));

    app.post(base + 'js/:super?/views/:type/finder/:view.:format', function (req, res, next) {
        this.generate(res, 'views/finder.' + req.params.format, makePostOptions(req), next);
    }.bind(this));

    app.post(base + ':view', function (req, res, next) {
        this.generate(res, req.params.view, makePostOptions(req), next);
    }.bind(this));
    app.post(base + 'js/:view', function (req, res, next) {
        this.generate(res, req.params.view, makePostOptions(req), next);
    }.bind(this));
    app.post(base + 'js/:super?/views/:view', function (req, res, next) {
        this.generate(res, req.params.view, makePostOptions(req), next);
    }.bind(this));

    app.post(base + 'js/:super?/views/:type/:view', function (req, res, next) {
        this.generate(res, 'views/' + req.params.view, makePostOptions(req), next);
    }.bind(this));

    app.post(base + 'js/:super?/:view/:type.:format', function (req, res, next) {
        this.generate(res, req.params.view + '.' + req.params.format, makePostOptions(req), next);
    }.bind(this));

    app.post(base + 'js/:super?/:view', function (req, res, next) {
        this.generate(res, req.params.view, makePostOptions(req), next);

    }.bind(this));
    app.post(base + 'templates/:super?/:type/:view', function (req, res, next) {
        this.generate(res, 'templates/' + req.params.view, makePostOptions(req), next);

    }.bind(this));
    app.post(base + 'tpl/:super?/:view', function (req, res, next) {
        this.generate(res, 'templates/' + req.params.view, makePostOptions(req), next);

    }.bind(this));
}
