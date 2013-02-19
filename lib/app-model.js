var _u = require('underscore'),
    util = require('./util'),
    easyget = util.easyget,
    Model = require('./display-model'),
    global_options = require('./globals')
// ,bus = require('./bus')
    ;


function App(options) {
    this.options = _u.extend({}, global_options, options);
//    Array.prototype.slice.call(arguments, 1).forEach(this.add, this);

    this._args = [];
    ['title', 'version', 'description', 'authors', 'modified', 'last_modified', 'revisions'].forEach(easyget(this._args), this);
    this.__defineGetter__('models', function () {
        return _u.map(this.modelPaths, function (k, v) {
            return k
        });
    });
    var ret;
    //TODO hrm do I need to worry about thread safety?
    this.__defineGetter__('modelPaths', function () {
        if (ret & !this._updated) {
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

    this.__defineGetter__('header', function () {
        var args = {};
        _u.each(this._args, function (v) {
            _u.each(v.header, function (i, k) {
                (args[k] || (args[k] = [])).push(i);
            });
        })
        return new Proxy(args, 2);
    })
    this.__defineGetter__('content', function () {
        var args = {};
        _u.each(this._args, function (v) {
            _u.each(v.content, function (i, k) {
                (args[k] || (args[k] = [])).push(i);
            });
        })
        return new Proxy(args, 2);
    })
}

function Proxy(args, depth) {
    if (!depth){
        _u.each(args, function(v,k){
            this[k] = _u.chain(v).compact().first().value();
        }, this);
        return this;
    }
    _u.each(args, function (vv, kk) {
        var a = {}
        _u.each(vv, function (v, k) {
            _u.each(v, function(vvv,kkk){
                (a[kkk] || (a[kkk] = [])).push(vvv);
            });
        });

        this.__defineGetter__(kk, function onProxyGetter() {
              return new Proxy(a, depth-1);
        });
    }, this)
}
App.prototype.add = function (App) {
    if (!App) return this;
    this._args.push(App);
    this._updated = true;
    //bus.emit('App.add', App);
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