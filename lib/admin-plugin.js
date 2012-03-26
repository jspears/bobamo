var EditModel = require('./edit-display-model'), _u = require('underscore');
module.exports = function ( app,base, model) {
    var EditFactory = new EditModel(model);
    app.get(base + 'admin/', function (req, res) {

        var models = [];
        model.models.forEach(function(v,k){
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
    });
    app.get(base + 'admin/model/:modelName', function (req, res) {
        var model = _u.extend({}, EditFactory.modelPaths[req.params.modelName].model);
        delete model._paths;
        res.send({
            status:0,
            payload:model
        })
    });
    app.get(base + 'admin/:modelName', function (req, res) {
        res.send({
            status:0,
            payload:EditFactory.modelPaths[req.params.modelName].schemaFor()
        })
    });


}