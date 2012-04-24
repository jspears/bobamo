var _u = require('underscore'), inflection = require('./inflection'), util = require('./util');
function easyget(args) {
    return function onEasyGet(v, k) {
        this.__defineGetter__(v, function () {
            return find(v, args);
        });
    };
}
function find(field, args) {
    for (var i = 0, l = args.length; i < l; i++) {
        var arg = args[i];
        if (!(_u.isUndefined(arg) || _u.isUndefined(arg[field])))
            return arg[field];
    }
}
function findAll(field, args) {
    if (!(args && args.length)) return;
    var ret = [];
    for (var i = 0, l = args.length; i < l; i++) {
        var arg = args[i];
        if (!(_u.isUndefined(arg) || _u.isUndefined(arg[field])))
            ret.push(arg[field]);
    }
    return ret.length && ret;
}
function toSubSchema(key) {
    var keys = key.split('.');
    var str = keys[0];
    for (var i = 1, l = keys.length; i < l; i++) {
        str += '.subSchema.' + keys[i];
    }
    return str;
}
var global_options = {
    read_only:['_id', 'id', 'id_', 'modified_by', 'created_by', 'created_at', 'modified_at'],
    builtin_editors:['Checkbox',
        'Checkboxes',
        'Date',
        'DateTime',
        'Hidden',
        'List',
        'NestedModel',
        'Number',
        'Object',
        'Password',
        'Radio',
        'Select',
        'Text',
        'TextArea']
}
function App(options) {
    this.options = _u.extend({}, global_options, options);
    Array.prototype.slice.call(arguments, 1).forEach(this.add, this);

    this._args = [];
    ['title', 'version', 'description'].forEach(easyget(this._args), this);
    this.__defineGetter__('models', function () {
        return _u.map(this.modelPaths, function (k, v) {
            return k
        });
    });
    var ret;
    //TODO hrm do I need to worry about thread safety?
    this.__defineGetter__('modelPaths', function () {
        if (ret &! this._updated) {
            return ret;
        }
        ret = {};
        var _modelPaths = {};

        this._args.forEach(function (k, v) {
            _u.each(k.modelPaths, function onAppArgs(vv, kk) {
                var key = vv.modelName || kk;
                (_modelPaths[key] || (_modelPaths[key] = [])).push(vv);
            }, this);

        }, this);

        _u.each(_modelPaths, function onModelPaths(v, k) {
            ret[k] = new Model(k, v);
        }, this);
        this._updated = false;
        return ret;
    });
    this.__defineGetter__('editors', function () {
        return this.options.builtin_editors.concat(this.options.plugin_editors);
    });
}
App.prototype.add = function (App) {
    if (!App) return this;
    this._args.push(App);
    this._updated = true;
    return this;
}
App.prototype.modelFor = function (model) {
    var Model = model;
    if (typeof model == 'string')
        Model = this.modelPaths[model];
    else if (model && model.modelName)
        Model = this.modelPaths[model.modelName];
    return Model;
}

App.prototype.schemaFor = function (model, fields) {
    return this.modelFor(model).schemaFor(fields)
}


function Model(modelName, args) {
    this.modelName = modelName;
    [ 'description'].forEach(easyget(args), this);

    var _paths  = {};
    args.forEach(function (v, k) {
        _u.each(v.paths, function onPathArgs(vv, kk) {
            (_paths[kk] || (_paths[kk] = [])).push(vv);
        }, this);
    }, this);

    this.__defineGetter__('paths', function onPathsGetter() {
        var ret = {};
        _u.each(_paths, function onPaths(v, k) {
            var field = ret[k] = new Field(k, v);
        }, this);
        return ret;
    });
    this.__defineGetter__('title', function onTitle() {
        var title = find('title', args) || inflection.titleize(inflection.humanize(modelName));
        return title;
    });
    this.__defineGetter__('plural', function onTitle() {
        var plural = find('plural', args) || inflection.titleize(inflection.pluralize(inflection.humanize(modelName)));
        return plural;
    });
    this.__defineGetter__('labelAttr', function onLabelAttrGet() {
        var labelAttr = find('labelAttr', args);
        if (labelAttr) return labelAttr;
        var labels = ['label', 'name', 'title'];
        for (var i = 0, l = labels.length; i < l; i++) {
            if (this.fields.indexOf(labels[i]) > -1)
                return labels[i];
        }
    });
    this.__defineGetter__('fields', function onFieldsGet() {
        var fields = find('fields', args);
        if (!fields) {
            fields = Object.keys(util.flatten(this.paths));
        }
        return fields;
    });
    this.__defineGetter__('edit_fields', function onEditFieldsGet() {
        var fields = find('edit_fields', args);
        if (!fields) {
            fields = this.fields.filter(filterRO, this.app);
        }
        return fields;
    });
    this.__defineGetter__('list_fields', function onListFieldsGet() {
        var fields = find('list_fields', args);
        if (!fields)
            fields = this.fields.filter(function (v, k) {
                return !(v == 'id' || v == '_id' || v == 'id_')
            });
        return fields;
    });
    this.__defineGetter__('fieldsets', function onFieldSetsGet() {
        var fieldsets = find('fieldsets', args);
        if (fieldsets)
            return fieldsets;
        return [
            {legend:this.title, fields:this.edit_fields}
        ]
    });
}
Model.prototype.pathFor = function (path) {
    var ret = util.depth(this.paths, toSubSchema(path));
    return ret;
}
function contains(arr, value) {
    return arr && arr.indexOf(value) > -1;
}
function filterRO(v, k) {
    return  global_options.read_only.indexOf(v) < 0;
}
Model.prototype.fieldsFor = function (list_type) {
    if (!list_type)
        list_type = this.fields;
    else if (typeof list_type == 'string') {
        list_type = this[list_type];
    }
    var ret = {};
    _u(list_type).each(function (k, i) {
        ret[k] = util.depth(this.paths, toSubSchema(k));
    }, this);
    return ret;
};
Model.prototype.editorsFor = function onEditorsFor(fields, schema) {
    schema = schema || this.schemaFor(fields);
    var editors = {};
    var flat = [];
    _u(fields || this.edit_fields).each(function (v, k) {
        if (v.fields)
            flat = flat.concat(v.fields);
        else
            flat.push(v);
    });

    _u(flat).each(function (k, v) {
        var c = util.depth(schema, k);
        if (c)
            do {
                var type = c.type;
                if (type && !(~global_options.builtin_editors.indexOf(type)))
                    editors[inflection.hyphenize(type)] = true;
                c = c.subSchema;

            } while (c && c.subSchema);
    });
    return Object.keys(editors).map(function (v) {
        return 'libs/editors/' + v
    });
}
Model.prototype.schemaFor = function onCreateSchema(fields) {
    var f = [];
    fields = this.fieldsets || this.edit_fields;
    _u(fields).each(function (v, k) {
        if (v.fields) {
            f = f.concat(v.fields);
        } else {
            f.push(v);
        }
    })
    var flatFields = this.fieldsFor(f);
    var schema = {};
    _u(flatFields).each(function (v, k) {
        util.depth(schema, toSubSchema(k), v, true);
    })
    return schema;
};
function collapseFields(args){
    var keys = [];
    _u(args).each(function(arg){
        keys = keys.concat(Object.keys(arg));
    })
    return _u(keys).unique();
}

function Field(path, args) {
    this.path = path;

    this.__defineGetter__('subSchema', function () {
        var subSchema = findAll('subSchema', args);
        if (subSchema && (this.type == 'Object' || this.listType == 'Object')) {
            var ret = {}
            _u.each(subSchema, function onSubSchemaNest(v, k) {
                _u(v).each(function (vv, kk) {
                    (ret[kk] || (ret[kk] = [])).push(vv)
                });
            });
            _u.each(ret, function onSubSchemaField(v, k) {
                ret[k] = new Field(path + '.' + k, v);
            });
            return Object.keys(ret).length && ret;
        }
    });
    this.__defineGetter__('title', function onFieldTitle() {
        var title = find('title', args) ||  inflection.titleize(inflection.humanize(this.path));
        return title;
    });
    _u(collapseFields(args)).reject(this.hasOwnProperty, this).forEach(easyget(args), this);
}

module.exports = App;