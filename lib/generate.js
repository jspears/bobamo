var _u = require('underscore'), inflection = require('./inflection'), EditApp = require('./edit-display-model');
module.exports = function (options, app) {
    var mongoose = options.mongoose || options;
//    console.log('factory',options.displayFactory);
    var factory = options.displayFactory; // ? options.displayFactory : (options.displayFactory = require('./display-model'));
    var editFactory = new EditApp(factory);
    var base = options.basepath || '';
    var jsRe = /\.js$/;
    base = base.replace(/\/+?$/, '');

    app.get(base + '/admin/:view', function (req, res, next) {
        var path = j('generate/admin', req.params.view, true);
        res.render(path, makeOptions(req))
    });
    app.get(base + '/:view', function (req, res, next) {
        var path = j('generate', req.params.view);
        res.render(path, makeOptions(req))
    });

    app.get(base + '/js/admin/:view', function (req, res, next) {
        var path = j('generate/admin', req.params.view, true);
        res.render(path, makeOptions(req))
    });
    app.get(base + '/js/:view', function (req, res, next) {
        var path = j('generate', req.params.view);
        res.render(path, makeOptions(req))
    });

    app.get(base + '/js/:super?/views/admin/:view', function (req, res, next) {
        //   res.contentType('text/html; charset=utf-8');
        res.render(j('generate', 'views/admin', req.params.view), makeOptions(req, true))

    });
    app.get(base + '/js/:super?/views/:view', function (req, res, next) {
        //   res.contentType('text/html; charset=utf-8');
        res.render(j('generate', req.params.view), makeOptions(req))

    });
    app.get(base + '/js/:super?/views/admin/:type/:view', function (req, res, next) {
        //     res.contentType('application/javascript');
        res.render(j('generate', 'views/admin', req.params.view), makeOptions(req, true));
    });

    app.get(base + '/js/:super?/views/:type/:view', function (req, res, next) {
        //     res.contentType('application/javascript');
        res.render(j('generate', 'views', req.params.view), makeOptions(req));
    });

    app.get(base + '/js/:super?/:clazz/:type', function (req, res, next) {
        //     res.contentType('application/javascript');
        res.render(j('generate', req.params.clazz + '.js'), makeOptions(req))
    });

    app.get(base + '/js/:super?/:view', function (req, res, next) {
        //   res.contentType('text/html; charset=utf-8');
        res.render(j('generate', req.params.view), makeOptions(req))

    });

    app.get(base + '/templates/:super?/admin/:type/:view', function (req, res, next) {
        //   res.contentType('text/html; charset=utf-8');
        res.render(j('generate', 'templates/admin', req.params.view), makeOptions(req, true))

    });
    app.get(base + '/templates/:super?/admin/:view', function (req, res, next) {
        //   res.contentType('text/html; charset=utf-8');
        res.render(j('generate', 'templates/admin', req.params.view), makeOptions(req))

    });
    app.get(base + '/templates/:super?/:type/:view', function (req, res, next) {
        //   res.contentType('text/html; charset=utf-8');
        res.render(j('generate', 'templates', req.params.view), makeOptions(req))

    });
    app.get(base + '/tpl/:super?/admin/:view', function (req, res, next) {
        //   res.contentType('text/html; charset=utf-8');
        res.render(j('generate', 'templates/admin', req.params.view), makeOptions(req, true))

    });
    app.get(base + '/tpl/:super?/:view', function (req, res, next) {
        //   res.contentType('text/html; charset=utf-8');
        res.render(j('generate', 'templates', req.params.view), makeOptions(req))

    });

    function j() {
        return Array.prototype.slice.call(arguments, 0).join('/');
    }

    function makeOptions(req, isAdmin) {

        var opts = {
            layout:false,
            params:req.params,
            baseUrl:base,
            api:(options.apiPath || base + '/api').replace(/(^\/|\/$)/g, ''),
            useAuthentication:req.isAuthenticated ? true : false,
            isAuthenticated:(req.isAuthenticated ? req.isAuthenticated() : null)
        }
        req.__app = factory;
        //for (var key in Object.keys(schemaHelpers)) {
        _u.each(schemaHelpers, function (value, key) {
            opts[key] = value(req);
        });
        var f = isAdmin ? editFactory : factory;
        opts.displayFactory = factory;
        opts.factory = f;

        if (req.params.type) {
            var type = req.params.type.replace(/(\.html|\.js|\.css)$/, '');
            if (type === 'admin')
                type = null;

            console.log('type', req.params.type);
            if (type) {
                opts.schema = req.__model = f.modelFor(type, req.user);

                var Model = req.__schema = f.schemaFor(type, req.user);

                _u.each(modelHelpers, function (value, key) {
                    opts[key] = value(req, opts.schema);
                });
            }

        }
        opts.isAdmin = isAdmin;
        return opts;
    }


    var schemaHelpers = {
        _models:function (req) {
            return function onModels(plain) {
                var models = factory.models;
                return plain ? models : JSON.stringify(models);
            }
        },
        _schema:function (req, Model) {
            return function onSchema(plain, m) {
                var schema = req.__model.schemaFor();
                return plain ? schema : JSON.stringify(schema);
            }
        },
        _app:function (req) {
            var f = req.params.admin ? editFactory : factory;
            return function onApp(plain) {
                return plain ? f : JSON.stringify(f);
            }
        }
    }
    var modelHelpers = {
        _title:function (req, Model) {
            return function onToTitle() {
                return factory.modelFor(Model).title;
            }
        },
        _paths:function (req, Model) {
            return function onSchema(plain) {
                var schema = req.__schema;

                return plain ? schema : JSON.stringify(paths);
            }
        },
        _fields:function (req, Model) {
            return function onFields(plain) {

                var fields = factory.modelFor(Model).fields;
                return  plain ? fields : JSON.stringify(fields);
            }
        },
        _defaults:function (req, Model) {
            return function onDefaults(plain) {
                var defs = req.__defaults;
                return  plain ? defs : JSON.stringify(defs);
            }
        },
        _editors:function (req, Model) {
            return function onEditors(plain, append) {
                var editors = createEditors(req.__app, Model);
                var editors = append ? editors.concat(append) : editors;
                return plain ? editors : JSON.stringify(editors);
            }
        }
    }

    var read_only = ['id', '_id', 'created_at', 'modified_at', 'created_by', 'modified_by']

    function createEditors(factory, model) {
        var CSchema = model.schemaFor(model.edit_fields);
        var ret = {};
        var def = false;
        _u.each(CSchema, function (v, k) {
            if (!v.type)
                return;

            if (factory.options.builtin_editors.indexOf(v.type) > -1)
                def = true;
            else
                ret['libs/editors/' + inflection.hyphenize(v.type)] = true;
        }, this)
        var stuff = Object.keys(ret);
        if (def)
            stuff.unshift('jquery-editors')
        return stuff;
    }
}