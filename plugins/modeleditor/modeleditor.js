var Plugin = require('../../lib/plugin-api'), util = require('util'), EditModel = require('./edit-display-model'), _u = require('underscore');

var EditPlugin = function() {
    Plugin.apply(this, arguments);
    this._appModel = {};
}
util.inherits(EditPlugin, Plugin);

var extRe = /\.(js|html|css|htm)$/i;
EditPlugin.prototype.admin = function(){
    return {
        href:'#/modeleditor/admin/list',
        title:'Model Settings'
    };
}
EditPlugin.prototype.appModel = function(){
    return this._appModel;
}
EditPlugin.prototype.configure = function(conf){
    return _u.extend(this._appModel, conf);
}
EditPlugin.prototype.routes = function () {

    this.app.all(this.pluginUrl + '*', function (req, res, next) {
        res.local('editModel', new EditModel(this.pluginManager.appModel, {
            editors:this.pluginManager.editors
        }));
        next();
    }.bind(this));

    var base = this.pluginUrl;
    console.log('base', base);
    var jsView = this.baseUrl + 'js/views/'+this.name;
    this.app.get(this.baseUrl+'js/views/modeleditor/admin/:type/:view', function (req, res, next) {
        var view = 'admin/'+req.params.view;

        var editModel = new EditModel(this.pluginManager.appModel, {
            editors:this.pluginManager.editors
        });
        res.local('model', editModel.modelPaths[req.params.type]);
        res.local('pluginUrl', this.pluginUrl);
        this.generate(res, view);
    }.bind(this))
    this.app.get(base + '/admin', function (req, res) {

        var models = [];
        var editModel = res.local('editModel');
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

    this.app.get(base + '/admin/model/:modelName', function (req, res) {
        var editModel = res.local('editModel');
        var model = _u.extend({},  editModel.modelPaths[req.params.modelName].model);
        delete model._paths;
        res.send({
            status:0,
            payload:model
        })
    }.bind(this));

    this.app.get(base + '/admin/:modelName', function (req, res) {
        var editModel = res.local('editModel');
        res.send({
            status:0,
            payload: editModel.modelPaths[req.params.modelName].schemaFor()
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
        this.save(sobj, function(err, data){
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