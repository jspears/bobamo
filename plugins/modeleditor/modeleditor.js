var Plugin = require('../../lib/plugin-api'), util = require('util'), EditModel = require('../../lib/edit-display-model');

var EditPlugin = function() {
    Plugin.apply(this, arguments);
    this.editModel = this.options.editModel || new EditModel();
}
util.inherits(EditPlugin, Plugin);

EditPlugin.prototype.routes = function () {

    Plugin.prototype.routes.call(this);
    var base = this.pluginUrl;
    console.log('base', base);
    this.app.all(this.pluginUrl + '*', function (req, res, next) {
        res.locals('editFactory', this.editModel);
        next();
    });

    this.app.get(base + 'admin/', function (req, res) {

        var models = [];
        this.editModel.models.forEach(function (v, k) {
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

    this.app.get(base + 'admin/model/:modelName', function (req, res) {
        var model = _u.extend({},  this.editModel.modelPaths[req.params.modelName].model);
        delete model._paths;
        res.send({
            status:0,
            payload:model
        })
    }.bind(this));

    this.app.get(base + 'admin/:modelName', function (req, res) {
        res.send({
            status:0,
            payload: this.editModel.modelPaths[req.params.modelName].schemaFor()
        })
    }.bind(this));

    this.app.put(base + 'admin/model/:id', function (req, res) {

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
        console.log('edited ', obj);
        res.send({
            status:0,
            payload:{_id:req.params.id}
        })
    }.bind(this));

}
module.exports = EditPlugin;