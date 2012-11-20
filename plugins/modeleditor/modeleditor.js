var Plugin = require('../../lib/plugin-api'), util = require('util'), EditModel = require('./edit-display-model'), _u = require('underscore'), mongoose = require('../../index').mongoose;

var EditPlugin = function () {
    Plugin.apply(this, arguments);
    this._appModel = {};
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
    return _u.extend(this._appModel, conf);
}
EditPlugin.prototype.routes = function () {

    this.app.all(this.pluginUrl + '*', function (req, res, next) {
        var editModel = new EditModel(this.pluginManager.appModel, {
            editors:this.pluginManager.editors
        });

        this.local(res, 'editModel', editModel);

        next();
    }.bind(this));

    var base = this.pluginUrl;
    console.log('base', base);
    var jsView = this.baseUrl + 'js/views/' + this.name;
    this.app.get(this.baseUrl + 'js/views/modeleditor/admin/:type/:view', function (req, res, next) {
        var view = 'admin/' + req.params.view;

        var editModel = new EditModel(this.pluginManager.appModel, {
            editors:this.pluginManager.editors
        });
        this.local(res, 'editModel', editModel);
        this.local(res, 'model', editModel.modelPaths[req.params.type]);
        this.local(res, 'pluginUrl', this.pluginUrl);
        this.generate(res, view);
    }.bind(this))

    this.app.get(base + '/admin/backbone/:modelName', function(req,res){
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
    this.app.get(base+'/admin/validators/:type', function(req,res){
        res.send({
            payload:[{name:'Required', message:'Field is required'}],
            status:0
        });
    }.bind(this));

    this.app.get(base+'/admin/types/schemas', function(req,res){
        //TODO abstract this in the displayModel
       res.send({
           payload:_u.map(mongoose.schemaTypes, function(v,k){return {type:k}}),
           status:0
       })
    }.bind(this));
    this.app.get(base+'/admin/types/models', function(req,res){
       res.send({
           payload:_u.map(this.pluginManager.appModel.modelPaths, function(v,k){
               var obj = {modelName:k};
               if (v.schema){
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
                  if (name == type || ReName.test(name) ){
                    editors.unshift(name);
                  }else if (~pos) {
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

    this.app.get(base + '/admin/model/:modelName', function (req, res) {
        var editModel = this.local(res, 'editModel');
        var model = _u.extend({}, editModel.modelPaths[req.params.modelName].model);
        delete model._paths;
        res.send({
            status:0,
            payload:model
        })
    }.bind(this));

    this.app.get(base + '/admin/:modelName', function (req, res) {
        var editModel = this.local(res, 'editModel');
        res.send({
            status:0,
            payload:editModel.modelPaths[req.params.modelName].schemaFor()
        })
    }.bind(this));

    function native(type){
        if (type == 'Number') return Number;
        if (type == 'String') return String;
        if (type == 'Date' || type == 'DateTime') return Date;

        return mongoose.Schema.Types[type] || type;
    }

    var fixup = function(req){
        var body = req.body;
        var model = _u.extend({paths:{}}, body.display);
        function onPath(obj){
            return function(v,k){
                var paths = v.paths;
                delete v.paths;

                var nobj = (obj[v.name] = _u.extend({},v));
                if (paths){
                    _u.each(paths, onPath((nobj.subSchema = {})));
                }
            }

        }
        _u.each(body.paths, onPath(model.paths))

    }
    var create =                               function (req, res, next) {
        var model = fixup(req.body);
        console.log('backbone schema', JSON.stringify(model, null, "\t"))
        res.send({
            status:0,
            payload:{_id:req.body.modelName}
        });

    }
    this.app.post(base + '/admin/preview', function(req, res, next){
        res.send({
            status:0,
            payload:fixup(req.body)
        })
    })
    this.app.post(base + '/admin/model', create);
    this.app.put(base + '/admin/backbone/:modelName?', create);
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