var Plugin = require('../../lib/plugin-api'), util = require('util'), App = require('../../lib/display-model'), EditModel = require('./edit-display-model'), _u = require('underscore'), mongoose = require('../../index').mongoose;

var EditPlugin = function () {
    Plugin.apply(this, arguments);
    this.conf = {modelPaths: {}};

}
util.inherits(EditPlugin, Plugin);
EditPlugin.prototype.fieldsets = {
    property: [
        {
            legend: 'Stuff',
            fields: []
        }
    ]
}

EditPlugin.prototype.admin = function () {
    return {
        href: '#/modeleditor/views/admin/list',
        title: 'Model Settings'
    };
}

EditPlugin.prototype.appModel = function () {
    return _u.extend(this.conf, {
        header: {
            'admin-menu': {

                'modeleditor': {
                    href: '#/modeleditor/views/admin/list',
                    label: 'Model Settings'
                }
            }
        }
    });
}
//EditPlugin.prototype.appModel = function () {
//    return this._appModel;
//}
EditPlugin.prototype.configure = function (conf) {
    if (conf && conf.modelPaths)
        _u.each(conf.modelPaths, function onModelConfigure(v, k) {
            var _configured = false
            // if (v.configurable) {
            this.pluginManager.forEach(function (plugin, name) {
                if (_configured) return;
                if (plugin && plugin.updateSchema) {
                    _configured = ( plugin.updateSchema(k, v) == true)

                    //console.log('updateSchema by', plugin.name, k);
                }
            });
            //}

        }, this);
    Plugin.prototype.configure.call(this, conf);
    return null;
}
/**
 * Looks up a model and a path.  withuot a model it returns all and
 * without a path.
 * with a path it just returns the subpaths.  If there is no
 * modelName and there is a path it guesses the first part of the
 * path is modelName = path.split('.').shift()
 * @param modelName
 * @param path
 * @returns {*|Array}
 */
EditPlugin.prototype.lookup = function (modelName, path) {
    var q = path && path.split('.') || [];
    modelName = modelName || q && q.shift();
    var modelPaths = this.pluginManager.appModel.modelPaths;
    if (!modelName)
        return Object.keys(modelPaths);
    var schema = modelPaths[modelName] && modelPaths[modelName].schema;
    var i = 0;
    for (var l = q.length; i < l; i++) {
        var part = q[i];
        if (part in schema) {
            if (schema[part].ref) {
                schema = modelPaths[schema[part].ref].schema;
            } else if (schema[part].schema) {
                schema = schema[part].schema;
            } else if (schema[part].subSchema) {
                schema = schema[part].subSchema;
            } else {
                schema = {};
                schema[part] = true;
                break;
            }
        } else {
            break;
        }
    }
    q.splice(i);
    return Object.keys(schema).map(function (v) {
        return q.concat(v).join('.')
    });
}
EditPlugin.prototype.routes = function () {
    var pm = this.pluginManager;
    this.app.all(this.pluginUrl + '*', function (req, res, next) {
        var editModel = new EditModel(pm.appModel, {
            editors: pm.editors
        });
        this.local(res, 'plugin', this);
        this.local(res, 'editModel', editModel);

        next();
    }.bind(this));

    var base = this.pluginUrl;
    var jsView = this.baseUrl + 'js/views/' + this.name;
    var lookup = this.lookup.bind(this);
    this.app.get(base + '/admin/properties/:modelName?', function (req, res, next) {
        var q = Object.keys(req.query).pop();
        q = q && q.replace('&', '') || '';
        res.send(lookup(req.params.modelName, q));
    });
    this.app.get(this.pluginUrl + '/views/admin/:type?/:view', function (req, res, next) {
        var view = 'admin/' + req.params.view;

        var editModel = new EditModel(this.pluginManager.appModel, {
            editors: this.pluginManager.editors

        });
        var mongoose = this.options.mongoose;
        this.local(res, 'editModel', editModel);
        this.local(res, 'model', editModel.modelPaths[req.params.type]);
        this.local(res, 'pluginUrl', this.pluginUrl);
        this.local(res, 'schemaTypes', function () {
            return _u.map(mongoose.SchemaTypes, function (v, k) {
                var disp = v.prototype.display

                return _u.extend({schemaType: k}, disp);
            });
        });
        var pm = this.pluginManager;
        this.generate(res, view);
    }.bind(this));

    this.app.get(base + '/admin/list/:type', function (req, res, next) {
        var pm = this.pluginManager;
        var appModel = pm.appModel;
        var model = appModel.modelPaths[req.params.type];
        res.send({
            status: 0,
            payload: {
                list: model.list_fields.map(function (v, k) {
                    if (_.isString(v)) {
                        var prop = model.pathFor(v);

                        return {
                            property: v,
                            title: prop.title || v,
                            renderer: pm.exec('renderer', 'rendererForProp', prop)._id
                        }
                    }
                    return v;
                }, this)
            }
        });

    }.bind(this));
    this.app.put(base + '/admin/list/:type', function (req, res, next) {
        var type = req.params.type;
        console.log('putting', req.params.type);
        if (!this.conf) this.conf = {};
        if (!this.conf.modelPaths) this.conf.modelPaths = {};
        var conf = this.conf.modelPaths[type] || (this.conf.modelPaths[type] = {});
        conf.list_fields = req.body.list;
        this.save(this.conf,
            function (e, o) {
                if (e)
                    return res.send({
                        status: 1,
                        errors: e
                    });
                return res.send({
                    status: 0,
                    payload: {
                        id: type
                    }
                });
            }
        )

    }.bind(this));

    this.app.get(base + '/admin/backbone/:modelName', function (req, res) {
        res.send({
            status: 0,
            payload: this.pluginManager.appModel.modelFor(req.params.modelName)
        })
    }.bind(this));
    this.app.get(base + '/admin', function (req, res) {

        var models = [];
        var editModel = this.local(res, 'editModel');
        editModel.models.forEach(function (v, k) {
            var m = _u.extend({}, _u.omit(v, 'schema', '_paths', 'model', 'fields', 'edit_fields', 'list_fields', 'fieldsets', 'editors'));
            m.description = v.model.description;
            models.push(m);
        });
        res.send({
            status: 0,
            payload: models
        })
    }.bind(this));
    this.app.get(base + '/admin/models', function (req, res) {

        var models = [];
        var editModel = this.local(res, 'editModel');
        editModel.models.forEach(function (v, k) {
            models.push({label: v.title, val: v.modelName});
        });
        res.send({
            status: 0,
            payload: models
        })
    }.bind(this));
    this.app.get(base + '/admin/validators/:type', function (req, res) {
        var pm = this.pluginManager;
        var validators = [];
        var type = req.params.type;
//
//        function onValidator(v, k) {
//            var idx;
//            if (v.types) {
//                if (~(idx = v.types.indexOf(type))) {
//                    if (idx == 0)
//                        validators.unshift(v)
//                    else
//                        validators.shift(v)
//                }
//            } else if (v.type)
//                validators.push({type:v.type})
//            else if (v instanceof String) {
//                validators.push({type:v})
//
//            }
//        }

        var validators = [];
        _u.each(pm.plugins, function (v, k) {
            var vals = v.validators(type);
            if (vals && vals.length)
                validators = validators.concat(vals);
        });
        res.send({
            payload: validators,
            status: 0
        });

    }.bind(this));

    this.app.get(base + '/admin/types/schemas', function (req, res) {
        //TODO abstract this in the displayModel
        res.send({
            payload: _u.map(this.options.mongoose.SchemaTypes, function (v, k) {
                var disp = v.prototype.display
                return _u.extend({schemaType: k}, disp || {});
            }),
            status: 0
        })
    }.bind(this));
    this.app.get(base + '/admin/types/models', function (req, res) {
        res.send({
            payload: _u.map(this.pluginManager.appModel.modelPaths, function (v, k) {
                var obj = {modelName: k};
                if (v.schema) {
                    obj.schema = schema;
                }
                return obj;
            }),
            status: 0
        })
    }.bind(this));
    /**
     * This tries to retrun the smartest editor for a type... The
     * funny rules are, in order of plugin, in order of editor, if name matches
     * exactly than use it otherwise add it to the list.  if there are no types
     * it is assumed usable for all types.
     */
    this.app.get(base + '/admin/editors', function (req, res, next) {
        res.send({
            status: 0,
            payload: pm.editors.map(function (v) {
                return v.name
            })
        })
    });
    this.app.get(base + '/admin/editors/:type', function (req, res) {
        var editors = [];
        var type = req.params.type;
        var ReName = new RegExp(type);
        this.pluginManager.forEach(function (plugin) {
            _u.each(plugin.editors(), function (edit, k) {
                var name = edit.name || k;
                if (edit.types) {
                    var pos = edit.types.indexOf(type);
                    if (name == type || ReName.test(name)) {
                        editors.unshift(name);
                    } else if (~pos) {
                        editors.push(name);
                    }
                } else if (_u.isString(edit)) {
                    editors.push(edit);
                }
            });
        });
        res.send({
            status: 0,
            payload: editors
        })

    }.bind(this));
    this.app.get(base + '/admin/editor/:name', function (req, res, next) {
        var name = req.params.name;
        var editor = _u(pm.editors).findWhere({name: name});
        res.send({
            status: 0,
            payload: editor
        })
    })
    this.app.post(base + '/admin/editorsFor', function (req, res, next) {
        var body = req.body;
        res.send({
            status: 0,
            payload: pm.editorsFor(body.path, body.property, pm.schemaFor(body.schema))
        })
    }.bind(this))


    this.app.get(base + '/admin/model/:modelName', function (req, res) {
        var editModel = this.local(res, 'editModel');
        var model = _u.extend({}, editModel.modelPaths[req.params.modelName].model);
        delete model._paths;
        res.send({
            status: 0,
            payload: model
        })
    }.bind(this));
    this.app.get(base + '/admin/form/:modelName', function (req, res) {
        res.send({
            status: 0,
            payload: {edit_fields: pm.appModel.modelPaths[req.params.modelName].fieldsets}
        })
    }.bind(this));

    this.app.get(base + '/admin/:modelName', function (req, res) {
        var editModel = this.local(res, 'editModel');
        res.send({
            status: 0,
            payload: editModel.modelPaths[req.params.modelName].schemaFor()
        })
    }.bind(this));
    function native(type) {
        if (type == 'Number') return Number;
        if (type == 'String') return String;
        if (type == 'Date' || type == 'DateTime') return Date;

        return mongoose.Schema.Types[type] || type;
    }

    function mapValidators(v, k) {
        var type, message;
        if (_u.isArray(v)) {
            type = v.length && v[0];
            message = v.length > 1 && v[1]
        }
        if (type instanceof RegExp) {
            return {
                type: 'regexp',
                configure: {
                    regexp: type.toString()
                }
            }
        } else if (type instanceof String) {
            return {
                type: v
            }
        } else if (v.validator) {
            return {
                type: v.validator,
                configure: JSON.stringify(v.configure),
                message: v.message
            }
        }
    }

    var fixup = function (body) {
        var model = _u.extend({schema: {}}, body.display);

        function onPath(obj) {
            return function (v, k) {
                var paths = v.schema;
                delete v.schema;

                var nobj = (obj[v.name] = _u.extend({}, v));
                var val = v.validate || v.validators;
                if (val) {
                    if (_u.isArray(val))
                        nobj.validators = _.map(val, mapValidators);
                    else
                        nobj.validators = mapValidators(val);
                    delete nobj.validate;


                }
                if (paths) {
                    _u.each(paths, onPath((nobj.subSchema = {})));
                }
            }

        }

        _u.each(body.schema, onPath(model.schema))
        return model;

    }

    this.app.post(base + '/admin/preview', function (req, res) {
        this.save(req.body, function () {
            res.send({
                status: 0,
                payload: req.body.modelName
            })
        })
    }.bind(this));
    var saveBackboneModel= function(req,res){
        var model = req.body;
        var persistPlugin = this.pluginManager.loadedPlugins[model.dbType || 'mongoose'];

        var modelName = model.modelName;
        if (!this.conf.modelPaths) {
            this.conf.modelPaths = {};
        }

        if (!persistPlugin.modelFor(modelName) || (this.conf && this.conf.modelPaths && this.conf.modelPaths[modelName] && this.conf.modelPaths[modelName].configurable)) {
            req.body.configurable = true;
            persistPlugin.updateSchema(modelName, model.schema);
        }
        this.conf.modelPaths[modelName] = model;
        this.save({
            modelPaths: this.conf.modelPaths
        }, function () {
            res.send({
                status: 0,
                payload: {modelName: modelName}
            })
        })
    }.bind(this);
    this.app.put(base + '/admin/backbone/:modelName?', saveBackboneModel);
    this.app.post(base + '/admin/backbone/:modelName?', saveBackboneModel);
    this.app.put(base + '/admin/view/:form/:model', function (req, res, next) {
        console.log('req form', req.params.form, req.params.model);
        res.send({
            status: 0,
            payload: {id: req.params.modelName}
        })

    }.bind(this));
    this.app.put(base + '/admin/model/:id', function (req, res, next) {

        var obj = _u.extend({}, req.body);
        _u.each(obj, function (v, k) {
            if (k.indexOf('.') > -1) {
                var splits = k.split('.');
                var ret = obj;
                while (splits.length > 1) {
                    var key = splits.shift();
                    if (_u.isUndefined(ret[key]))
                        ret[key] = {};
                    ret = ret[key];
                }
                ret[splits.shift()] = v;
                delete obj[k];
            }
        });
        var sobj = this.conf.modelPaths || (this.conf.modelPaths = {});
        var pobj = sobj[req.params.id] || (sobj[req.params.id] = {});
        _u.extend(pobj, req.body);

        this.save(pobj, function (err, data) {
            if (err)
                return next(err);
            res.send({
                status: 0,
                payload: data
            })
        }.bind(this));
    }.bind(this));
    //Form Editor support
    this.app.get(base + '/admin/model/:view/:modelName', function (req, res) {
        var type = req.params.modelName;
        var conf = this.conf.modelPaths && this.conf.modelPaths[type];
        var mconf = this.pluginManager.appModel.modelPaths[type];
        if (conf){
            conf = _.extend({}, mconf, conf);
        }
        res.send({
            status: 0,
            payload: conf
        })
    }.bind(this));

    this.app.put(base + '/admin/model/:view/:modelName', function (req, res) {
        var type = req.params.modelName;
        var view = req.params.view;
        if (!this.conf.modelPaths) this.conf.modelPaths = {};
        var conf = this.conf.modelPaths[type] || (this.conf.modelPaths[type] = {});
        conf[view] = req.body[view];
        this.save(this.conf,
            function (e) {
                if (e)
                    return res.send({
                        status: 1,
                        errors: e
                    });
                return res.send({
                    status: 0,
                    payload: conf
                });
            }
        )
    }.bind(this));


    Plugin.prototype.routes.apply(this, arguments);

}
module.exports = EditPlugin;
