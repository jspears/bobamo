var _u = require('underscore'), inflection = require('./inflection');
function easyget(args) {
    return function onEasyGet(v, k) {
        this.__defineGetter__(v, function () {
            return find(v, args);
        });
    };
}
function find(field, args) {
    for (var i = 0, l = args.length; i < l; i++) {
        if (typeof args[i][field] !== 'undefined')
            return args[i][field];
    }

}
function App() {
    var args = Array.prototype.slice.call(arguments, 0);
    ['title', 'version', 'description'].forEach(easyget(args), this);
    this.models = [];
    this._modelPaths = {};
    args.forEach(function (k, v) {

        _u.each(k.modelPaths, function onAppArgs(vv, kk) {
            var key = vv.modelName || kk;
            (this._modelPaths[key] || (this._modelPaths[key] = [])).push(vv);
        }, this);

    }, this);
    this.models = _u.map(this._modelPaths, function (k, v) {
        return k
    });
    this.__defineGetter__('modelPaths', function () {
        var ret = {};
        _u.each(this._modelPaths, function onModelPaths(v, k) {
           ret[k] = new Model(k, v);
        }, this);
        return ret;
    });
}
App.prototype.schemaFor = function(model, fields){
    var Model = model;
    if(typeof model == 'string')
        Model = this.modelPaths[model];
    else if (model && model.modelName)
        Model = this.modelPaths[model.modelName];

    return Model.schemaFor(fields)
}

function Model(modelName, args) {
    this.modelName = modelName;
    [ 'description'].forEach(easyget(args), this);

    var _paths = this._paths = {};
    args.forEach(function (v, k) {
        _u.each(v.paths, function onPathArgs(vv, kk) {
            (_paths[kk] || (_paths[kk] = [])).push(vv);
        }, this);
    }, this);
    this.paths = _u.map(this._paths, function (k, v) {
        return k
    });
    this.__defineGetter__('paths', function onPathsGetter() {
        var ret = {};
        _u.each(this._paths, function onPaths(v, k) {
            var field = ret[k] = new Field(k, v);
        }, this);
        return ret;
    });
    this.__defineGetter__('title', function onTitle() {
        var title = find(args, 'title') || inflection.titleize(inflection.humanize(modelName));
        return title;
    });
    this.__defineGetter__('plural', function onTitle() {
        var plural = find(args, 'plural') || inflection.titleize(inflection.pluralize(inflection.humanize(modelName)));
        return plural;
    });
    this.__defineGetter__('labelAttr', function onLabelAttrGet() {
        var labelAttr = find(args, 'labelAttr');
        if (labelAttr) return labelAttr;
        var skip = _u(this.paths).filter(function (v, k) {
            return !(k == 'id' || k == '_id');
        });
        if (skip.find(_label))
            return 'label';
        if (skip.find(_name))
            return 'name';
        if (skip.find(_description))
            return 'description';
    });
    this.__defineGetter__('fields', function onFieldsGet() {
        var fields = find(args, 'fields');
        if (!fields)
            return Object.keys(this.paths);
        return fields;
    });
    this.__defineGetter__('edit_fields', function onEditFieldsGet() {
        var fields = find(args, 'edit_fields');
        if (!fields)
            return this.fields;
        return fields;
    });
    this.__defineGetter__('list_fields', function onListFieldsGet() {
        var fields = find(args, 'list_fields');
        if (!fields)
            return this.fields;
        return fields;
    });

}
Model.prototype.fieldsFor = function (list_type) {
    if (!list_type)
        list_type = this.fields;
    else if (typeof list_type == 'string') {
        list_type = this[list_type];
    }
    var ret = {};
    _u(list_type).each(function (k, i) {
        ret[k] = this.paths[k];
    }, this);
    return ret;
};

Model.prototype.schemaFor = function onCreateSchema(fields) {
    var schema = {};
    _u(this.fieldsFor(fields)).each(function (v,k) {
        if (k.indexOf('.') < 0)
            schema[k] = v;
        else {
            var split = k.split('.');
            var obj = schema;
            while (split.length - 1) {
                var key = split.shift();
                obj = ( obj[key] || (obj[key] = {path:key, type:'Object', subSchema:{}})).subSchema;
            }
            var last = split.shift();
            obj[last] = v;
        }
    }, this);

    return schema;
};

var _prop = function (key) {
    return function (v, k) {
        return key == k;
    }
}
var _name = _prop('name'), _label = _prop('label'), _description = _prop('description');
function Field(path, args) {
    this.path = path;
    ['title', 'dataType', 'help', 'url', 'type', 'subSchema'].forEach(easyget(args), this);
}

module.exports = App;