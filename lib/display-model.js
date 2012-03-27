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
var global_options = {
    read_only:['_id','id', 'id_', 'modified_by','created_by','created_at','modified_at'],
    builtin_editors:   ['Checkbox',
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
    'TextArea'],
    plugin_editors:['MultiEditor']
}
function App(options) {
    this.options = _u.extend({}, global_options, options);
    var args = Array.prototype.slice.call(arguments, 0);
    ['title', 'version', 'description'].forEach(easyget(args), this);
    this._modelPaths = {};
    args.forEach(function (k, v) {

        _u.each(k.modelPaths, function onAppArgs(vv, kk) {
            var key = vv.modelName || kk;
            (this._modelPaths[key] || (this._modelPaths[key] = [])).push(vv);
        }, this);

    }, this);
    this.__defineGetter__('models', function () {
      return _u.map(this.modelPaths, function (k, v) {
            return k
        });
    });

    this.__defineGetter__('modelPaths', function () {
        var ret = {};
        _u.each(this._modelPaths, function onModelPaths(v, k) {
           var model = ret[k] = new Model(k, v);
        }, this);
        return ret;
    });
    this.__defineGetter__('editors', function(){
        return this.options.builtin_editors.concat(this.options.plugin_editors);
    });
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

    var _paths = this._paths = {};
    args.forEach(function (v, k) {
        _u.each(v.paths, function onPathArgs(vv, kk) {
            (_paths[kk] || (_paths[kk] = [])).push(vv);
        }, this);
    }, this);

    this.__defineGetter__('paths', function onPathsGetter() {
        var ret = {};
        _u.each(this._paths, function onPaths(v, k) {
            var field = ret[k] = new Field(k, v);
        }, this);
        return ret;
    });
    this.__defineGetter__('title', function onTitle() {
        var title = find('title',args) || inflection.titleize(inflection.humanize(modelName));
        return title;
    });
    this.__defineGetter__('plural', function onTitle() {
        var plural = find('plural',args) || inflection.titleize(inflection.pluralize(inflection.humanize(modelName)));
        return plural;
    });
    this.__defineGetter__('labelAttr', function onLabelAttrGet() {
        var labelAttr = find('labelAttr',args);
        if (labelAttr) return labelAttr;
        var labels = ['label','name','title'];
        for(var i=0,l=labels.length;i<l;i++){
           if (this.fields.indexOf(labels[i]) > -1)
            return labels[i];
        }
    });
    this.__defineGetter__('fields', function onFieldsGet() {
        var fields = find('fields',args);
        if (!fields)
            fields = Object.keys(this.paths);
        return fields;
    });
    this.__defineGetter__('edit_fields', function onEditFieldsGet() {
        var fields = find( 'edit_fields', args);
        if (!fields){
            fields = this.fields.filter(filterRO, this.app);
        }
        return fields;
    });
    this.__defineGetter__('list_fields', function onListFieldsGet() {
        var fields = find('list_fields',args);
        if (!fields)
            return this.fields.filter(function(v,k){
                return !(v == 'id' || v == '_id' || v == 'id_')
            });
        return fields;
    });
    this.__defineGetter__('fieldsets', function onFieldSetsGet(){
        var fieldsets =  find('fieldsets', args);
        if (fieldsets)
        return fieldsets;
        return [{legend:this.title,fields:this.edit_fields}]
    });
}
function contains(arr, value){
    return arr && arr.indexOf(value) > -1;
}
function filterRO(v,k){
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
        ret[k] = this.paths[k];
    }, this);
    return ret;
};

Model.prototype.schemaFor = function onCreateSchema(fields) {
    var schema = {};
    var f = [];
    fields = this.fieldsets || this.edit_fields;
     _u(fields).each(function(v,k){
         if (v.fields){
             f = f.concat(v.fields);
         }else{
             f.push(v);
         }
     })
     _u(this.fieldsFor(f)).each(function (v, k) {
        if (k.indexOf('.') < 0)
            schema[k] = v;
        else {
            var split = k.split('.');
            var obj = schema;

            while (split.length - 1) {
                var key = split.shift();
                obj = ( obj[key] || (obj[key] = {path:key, type:'Object', subSchema:{}})).subSchema;
            }
            obj[split.shift()] = v;
        }
    }, this);

    return schema;
};

function Field(path, args) {
    this.path = path;
    ['title', 'dataType', 'help', 'url', 'type', 'subSchema'].forEach(easyget(args), this);
}

module.exports = App;