var _u = require('underscore'), util = require('./util'), easyget = util.easyget, Model = require('./display-model'), global_options = require('./globals');


function App(options) {
    this.options = _u.extend({}, global_options, options);
//    Array.prototype.slice.call(arguments, 1).forEach(this.add, this);

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
            var paths = k.modelPaths || k.models;
            if (!_u.isUndefined(paths))
                _u.each(paths, function onAppArgs(vv, kk) {
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
module.exports = App;