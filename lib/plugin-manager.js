var fs = require('fs'), path = require('path'), _u = require('underscore'), util = require('./util'), App = require('./display-model');
var PluginManager = function (options, app) {
    this.options = _u.extend({}, options);
    this.plugins = options.plugins || this.loadPlugins(options, app);
    this.options.displayFactory = this._app = new App(options, this.loadMongoModels());
}
PluginManager.prototype.app = function () {
    return this._app;
}
PluginManager.prototype.loadMongoModels = function () {
    var self = this;
    var mongoose = this.options.mongoose;
    return new function () {
        this.__defineGetter__('modelPaths', function () {
            var ret = {};
            _u.each(mongoose.models, function (v, k) {
                ret[v.modelName] = new MModel(v, self);
            }, this);
            return ret;
        });
    }
}

PluginManager.prototype.loadPlugins = function (options, app) {
    var dirs = [].concat(options.pluginDir)

    dirs.push(path.join(path.dirname(module.filename), '../plugins'));
    dirs.push(path.join(process.cwd(), '../plugins'));
    var plugins = [];
    dirs.forEach(function (dir) {
        if (!path.existsSync(dir))
            return;
        try {
            fs.readdirSync(dir).forEach(function (pdir) {
                var name = path.basename(pdir);
                var fpath = path.join(dir, pdir, name + '.js');
                if (path.existsSync(fpath)) {
                    try {
                        var Plugin = require(fpath);
                        plugins.push(new Plugin(options, app, name));
                    } catch (e) {
                        console.warn('error loading plugin [' + fpath + ']', e);
                    }
                } else {
                    console.log('does not exist', fpath);
                }
            }, this);
        } catch (e) {
            console.warn('error loading dir [' + dir + ']', e);
        }
    });
    return plugins;
}
PluginManager.prototype.createModel = function (m) {
    return new MModel(m, this);
}

PluginManager.prototype.pluginFor = function (path, property, object) {
    for (var i = 0, l = this.plugins.length; i < l; i++) {
        var field = this.plugins[i].editorFor(path, property, object);
        if (field) {
            return new MField(property, field);
        }
    }

}

function MModel(m, manager) {
      this.__defineGetter__('modelName', function () {
        return m.modelName;
    });
    this.__defineGetter__('plural', function () {
        return util.depth(m, ['plural'], null);
    });
    this.__defineGetter__('title', function () {
        return util.depth(m, ['title'], null);

    });

    this.__defineGetter__('description', function () {
        return m.description;
    });

    var display = util.depth(m, ['schema', 'options', 'display'], {});
    this.fields = display.fields;
    this.list_fields = display.list_fields;
    this.edit_fields = display.edit_fields;
    this.labelAttr = display.labelAttr;
    this.fieldsets = display.fieldsets;
    this.__defineGetter__('paths', function () {
        var ret = {};
        m.schema.eachPath(function (k, v) {
            ret[k] = manager.pluginFor(k, v, m);
        });
        _u.each(m.schema.virtuals, function (v, k) {
            ret[k] = manager.pluginFor(k, v, m);
        });

        return ret;
    });
}
function MField(p, field) {
    this.path = p;
    _u.extend(this, field);
}

function _m(Model) {
    if (typeof Model === 'string')
        Model = mongoose.model(Model);
    return Model;
}
module.exports = PluginManager;


