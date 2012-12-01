var Plugin = require('../../lib/plugin-api'), util = require('util'), App = require('../../lib/display-model'), EditModel = require('./edit-display-model'), _u = require('underscore'), mongoose = require('../../index').mongoose;

var EditPlugin = function () {
    Plugin.apply(this, arguments);
    this._appModel = {modelPaths:{}};
}
util.inherits(EditPlugin, Plugin);

var extRe = /\.(js|html|css|htm)$/i;
EditPlugin.prototype.admin = function () {
    return {
        href:'#/modeleditor/admin/list',
        title:'Model Settings'
    };
}
EditPlugin.prototype.appModel = function () {
    return this._appModel;
}
EditPlugin.prototype.configure = function (conf) {
    if (conf  && conf.modelPaths)
    _u.each(conf.modelPaths, function onModelConfigure(v,k){
          if (v.configurable)
             this.pluginManager.loadedPlugins[v.dbType || 'mongoose'].updateSchema(k, v);

    }, this);
    new App(conf);
    return _u.extend(this._appModel, conf);
}
EditPlugin.prototype.routes = function () {

    // this route intercepts and preceeds all for #/modeleditor path and UI, it creates passes an array of editors from backbone-forms
    // called EditModel through the static plugin - js/libs/editors
    this.app.all(this.pluginUrl + '*', function (req, res, next) {
        // the pluginManager.appModel is the entry point for models into the modeleditor plugin
        // models are created in the mongoose plugins as MModels and then dressed up for display with
        // display-model.js (DisplayModel) from the PluginManager and then further dressed up for editing with editors
        // with EditModel here gets constructed from display-model.js (DisplayModel) from the PluginManager
        var editModel = new EditModel(this.pluginManager.appModel, {
            editors:this.pluginManager.editors
        });

        this.local(res, 'editModel', editModel);

        next();
    }.bind(this));

    var base = this.pluginUrl; // /modeleditor
    console.log('base', base);
    var jsView = this.baseUrl + 'js/views/' + this.name;

    // this route handles editing existing model, type -> model name (e.g. user), view = backbone view for editing (e.g. edit)
    // this.baseURL = /
    this.app.get(this.baseUrl + 'js/views/modeleditor/admin/:type/:view', function (req, res, next) {
        var view = 'admin/' + req.params.view;

        var editModel = new EditModel(this.pluginManager.appModel, {
            editors:this.pluginManager.editors
        });
        // app.local variables that are passed to the template
        this.local(res, 'editModel', editModel);
        this.local(res, 'model', editModel.modelPaths[req.params.type]);
        this.local(res, 'pluginUrl', this.pluginUrl);
        this.generate(res, view);
    }.bind(this))

    this.app.get(base + '/admin/backbone/:modelName', function (req, res) {
        console.log('model', req.params.modelName);
        res.send({
            status:0,
            payload:this.pluginManager.appModel.modelFor(req.params.modelName)
        })
    }.bind(this));
    this.app.get(base + '/admin', function (req, res) {

        var models = [];
        var editModel = this.local(res, 'editModel');
        editModel.models.forEach(function (v, k) {
            var m = _u.extend({}, v);
            delete m.paths;
            delete m._paths;
            delete m.model;
            delete m.fields;
            delete m.edit_fields;
            delete m.list_fields;
            delete m.fieldsets;
            delete m.editors;
            delete m.schema;
            models.push(m);
        });
        res.send({
            status:0,
            payload:models
        })
    }.bind(this));
    this.app.get(base + '/admin/models', function (req, res) {

        var models = [];
        var editModel = this.local(res, 'editModel');
        editModel.models.forEach(function (v, k) {
            models.push({label:v.title, val:v.modelName});
        });
        res.send({
            status:0,
            payload:models
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
            var vals =v.validators(type);
            if (vals && vals.length)
                validators = validators.concat(vals);
        });
        res.send({
            payload:validators,
            status:0
        });

    }.bind(this));

    this.app.get(base + '/admin/types/schemas', function (req, res) {
        //TODO abstract this in the displayModel
        res.send({
            payload:_u.map(mongoose.schemaTypes, function (v, k) {
                return {type:k}
            }),
            status:0
        })
    }.bind(this));
    this.app.get(base + '/admin/types/models', function (req, res) {
        res.send({
            payload:_u.map(this.pluginManager.appModel.modelPaths, function (v, k) {
                var obj = {modelName:k};
                if (v.schema) {
                    obj.schema = schema;
                }
                return obj;
            }),
            status:0
        })
    }.bind(this));
    /**
     * This tries to retrun the smartest editor for a type... The
     * funny rules are, in order of plugin, in order of editor, if name matches
     * exactly than use it otherwise add it to the list.  if there are no types
     * it is assumed usable for all types.
     */

    this.app.get(base + '/admin/editors/:type', function (req, res) {
        var editors = [];
        var type = req.params.type;
        var ReName = new RegExp(type);
        _u.each(this.pluginManager.plugins, function (plugin) {
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
            status:0,
            payload:editors
        })

    }.bind(this));

    this.app.post(base +'/admin/editorsFor', function (req,res, next){
        var body = req.body;
        console.log('editorsFor',body);
        res.send({
            status:0,
            payload:this.pluginManager.editorsFor(body.path, body.property, this.pluginManager.schemaFor(body.schema))
        })
    }.bind(this))


    this.app.get(base + '/admin/model/:modelName', function (req, res) {
        var editModel = this.local(res, 'editModel');
        var model = _u.extend({}, editModel.modelPaths[req.params.modelName].model);
        delete model._paths;
        res.send({
            status:0,
            payload:model






        })
    }.bind(this));

    // this route gets a model with all its metadata for backbone UI, the backbone model parses the
    // payload object in the response
    this.app.get(base + '/admin/:modelName', function (req, res) {
        var editModel = this.local(res, 'editModel');
        res.send({
            status:0,
            payload:editModel.modelPaths[req.params.modelName].schemaFor()
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
                type:'regexp',
                configure:{
                    regexp:type.toString()
                }
            }
        } else if (type instanceof String) {
            return {
                type:v
            }
        } else if (v.validator) {
            return {
                type:v.validator,
                configure:JSON.stringify(v.configure),
                message:v.message
            }
        }
    }

    var fixup = function (body) {
        var model = _u.extend({paths:{}}, body.display);

        function onPath(obj) {
            return function (v, k) {
                var paths = v.paths;
                delete v.paths;

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

        _u.each(body.paths, onPath(model.paths))
        return model;

    }

    this.app.post(base + '/admin/preview', function(req,res){
        this.save(req.body, function(){
            res.send({
                status:0,
                payload:req.body.modelName
            })
        })
    }.bind(this));
    var appModel = this.pluginManager.appModel;
    this.app.put(base + '/admin/backbone/:modelName?', function(req,res){

        var persistPlugin =  this.pluginManager.loadedPlugins[req.body.dbType || 'mongoose'];

        var modelName = req.body.modelName;


        if (!persistPlugin.modelFor(modelName) || (this._appModel &&  this._appModel.models && this._appModel.models[modelName] && this._appModel.models[modelName].configurable) ){
            req.body.configurable = true;
            persistPlugin.updateSchema(modelName, req.body.schema);
        }
        this._appModel.modelPaths[modelName] =req.body;
        this.save(this._appModel, function(){
            res.send({
                status:0,
                payload:{modelName:modelName}
            })
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
        var sobj = {modelPaths:{}};
        sobj.modelPaths[req.params.id] = obj;
        console.log('edited ', sobj);
        this.save(sobj, function (err, data) {
            if (err)
                return next(err);
            res.send({
                status:0,
                payload:data
            })
        }.bind(this));
    }.bind(this));


    Plugin.prototype.routes.apply(this, arguments);

}
module.exports = EditPlugin;
