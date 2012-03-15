var _u = require('underscore');
function easyget(args) {
    return function onEasyGet(v,k) {
        this.__defineGetter__(v, function () {
            for (var i = 0, l = args.length; i < l; i++) {
                if (typeof args[i][v] !== 'undefined')
                    return args[i][v];
            }
        })

    }
}
function App() {
    var args = Array.prototype.slice.call(arguments, 0);
    ['title', 'version', 'description'].forEach(easyget(args), this);
    this.models = [];
    this._modelPaths = {};
    args.forEach(function (k, v) {
        _u.each(k.models, function onAppArgs(vv, kk) {
            var key = vv.modelName || kk;
            (this._modelPaths[key] || (this._modelPaths[key] = [])).push(vv);
        }, this);

    }, this);
    this.models = _u.map(this._modelPaths, function(k,v){return k});
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
    ['title', 'plural', 'description'].forEach(easyget(args), this);

    this._paths = {};
    args.forEach(function (v, k) {
        _u.each(v.paths, function onPathArgs(vv, kk) {
            (this._paths[kk] || (this._paths[kk] = [])).push(vv);
        }, this);
    }, this);
    this.paths =  _u.map(this._paths, function(k,v){return k});
    this.__defineGetter__('paths', function onPathsGetter() {
        var ret = {};
        _u.each(this._paths, function onPaths(v, k) {
            var field = ret[k] = new Field(k, v);

        }, this);
        return ret;
    });
}
function Field(key, args) {
    this.key = key;
    ['title', 'dataType', 'help', 'url', 'type'].forEach(easyget(args), this);
}

module.exports = App;