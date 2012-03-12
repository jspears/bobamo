var mongoose = require('mongoose'), factory = require('../app/lib/display-factory').DisplayFactory, _u = require('underscore');
module.exports = function (app) {
    var jsRe = /\.js$/;

    app.get('/js/:super?/views/:type/:view', function (req, res, next) {
        //     res.contentType('application/javascript');
        res.render(j('generate', 'views', req.params.view), makeOptions(req));
    });
    app.get('/js/:super?/:clazz/:type', function (req, res, next) {
        //     res.contentType('application/javascript');
        res.render(j('generate', req.params.clazz + '.js'), makeOptions(req))
    });
    app.get('/templates/:super?/:type/:view', function (req, res, next) {
        //   res.contentType('text/html; charset=utf-8');
        res.render(j('generate', 'templates', req.params.view), makeOptions(req))

    });
    app.get('/tpl/:super?/:view', function (req, res, next) {
        //   res.contentType('text/html; charset=utf-8');
        res.render(j('generate', 'templates', req.params.view), makeOptions(req))

    });

    function j() {
        return Array.prototype.slice.call(arguments, 0).join('/');
    }

    function makeOptions(req) {

        var opts = {
            layout:false,
            params:req.params
        }

        //for (var key in Object.keys(schemaHelpers)) {
        _u.each(schemaHelpers, function (value, key) {
            opts[key] = value(req);
        });

        if (req.params.type) {
            var Model = opts.schema = mongoose.model(req.params.type.replace(jsRe, ''));
            req.__schema = factory.createSchema(Model, req.user);
            req.__fields = factory.createFields(Model, req.user);
            req.__defaults = factory.createDefaults(Model, req.user);
            req.__editors = factory.createEditors(Model, req.user);
            _u.each(modelHelpers, function (value, key) {
                opts[key] = value(req, Model);
            });

        }
        return opts;
    }

    var schemaHelpers = {
        _models:function (req) {
            return function onModels(plain) {
                var models = factory.listModels(req.user);
                return plain ? models : JSON.stringify(models);
            }
        }
    }
    var modelHelpers = {
        _title:function (req, Model) {
            return function onToTitle() {
                return factory.createTitle(Model, req.user);
            }
        },
        _paths:function (req, Model) {
            return function onSchema(plain) {
                var schema = req.__schema;
                var paths = plain ? schema.paths : JSON.stringify(schema.paths);
                return paths;
            }
        },
        _schema:function (req, Model) {
            return function onSchema(plain) {
                var schema = req.__schema;
                return plain ? schema : JSON.stringify(schema);
            }
        },
        _fields:function (req, Model) {
            return function onFields(plain) {

                var fields = req.__fields;
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
                var editors = append ? req.__editors.concat(append) : req.__editors;
                return plain ? editors : JSON.stringify(editors);
            }
        }
    }
}