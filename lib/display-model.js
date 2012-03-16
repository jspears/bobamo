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
            var model = ret[k] = new Model(k, v);
        }, this);
        return ret;
    });
}

function Model(modelName, args) {
    this.modelName = modelName;
    [ 'description'].forEach(easyget(args), this);

    this._paths = {};
    args.forEach(function (v, k) {
        _u.each(v.paths, function onPathArgs(vv, kk) {
            (this._paths[kk] || (this._paths[kk] = [])).push(vv);
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
        var first = _u(this.paths).filter(function (v, k) {
            return !(k == 'id' || k == '_id');
        })
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
function Field(key, args) {
    this.key = key;
    ['title', 'dataType', 'help', 'url', 'type', 'subSchema'].forEach(easyget(args), this);
}

module.exports = App;