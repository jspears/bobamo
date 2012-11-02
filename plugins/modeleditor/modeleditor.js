// controller that handles routes for model editing plugin: Admin->Model Settings
var Plugin = require('../../lib/plugin-api'), util = require('util'), EditModel = require('./edit-display-model'), _u = require('underscore');

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

    // this route handles creating a new model, type -> model name (e.g. user), view = backbone view for editing (e.g. edit)
    // this.baseURL = /
    this.app.get(this.baseUrl + 'js/views/modeleditor/admin/model/:view', function (req, res, next) {
        var view = 'admin/' + req.params.view;
        var editModel = new EditModel(this.pluginManager.appModel, {
            editors:this.pluginManager.editors
        });
        // to create a new model first we need to add a new entry into editModel instance
        editModel.modelPaths
        // app.local variables that are passed to the template
        this.local(res, 'editModel', editModel);
        this.local(res, 'model', editModel.schemaFor());
        this.local(res, 'pluginUrl', this.pluginUrl);
        this.generate(res, view);
    }.bind(this));

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
    }.bind(this));

    // the rest of the routes below that bypass the UI are used as RESTful services that are called by URL to populate the
    // the Backbone model in other views like the edit.js view

    // this route gets a list of model with summary information only for backbone view display
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
            models.push(m);
        });
        res.send({
            status:0,
            payload:models
        })
    }.bind(this));

    // this route gets a model without its path metadata for backbone UI, the backbone model parses the
    // payload object in the response
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

    // this route is called to update a model through backbone UI
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
