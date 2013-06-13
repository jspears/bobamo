var path = require('path'), _u = require('underscore'),
    AppModel = require('./app-model'),
    PluginApi = require('./plugin-api'),
    FilePersistence = require('./file-persistence'),
    Q = require('q'),
    fs = require('fs'),
    pslice = Array.prototype.slice,
    psplice = Array.prototype.splice,
    requirejs = require('requirejs');

/**
 *
 * @param options  // options to use
 * @param express // an app instance.
 */
var PluginManager = function (options, express) {
    this.requireConfig = {
        paths: {}
    };

    this.options = _u.extend({}, options);
    this.configFile = this.options.configFile || path.join(process.cwd(), 'conf', 'bobamo.json');
    this.persist = options.persist || new FilePersistence(this.configFile);
    this.plugins = this.loadPlugins(this.options, express);
    this.requireConfig.nodeRequire = require;
    this.requirejs = requirejs
    this.requirejs.config(this.requireConfig);
    this.requirejs = requirejs
    var loaded = this.loadedPlugins = options.loadedPlugins = {};
    _u.each(this.plugins, function (v, k) {
        loaded[v.name] = v;
    }, this);
    this.appModel = new AppModel(this.options);
    Q.when(this.loadAppModels()).
        then(this.loadFilters()).
        then(this.loadRoutes()).
        then(this.configure()).
        done(function(){
            this.done().then(function(){
                if (options.ready)
                    options.ready.resolve(arguments);
            });
        }.bind(this));
    options.ready.promise.then(function(){
        if (this.reconfigure && this.reconfigure.length){
            this.setupToken = this.gentoken();
            console.log('need to configure', this.reconfigure);
            console.warn("\n\n\nSystem Setup Token: " + this.setupToken+"\n\n\n");
        }
        console.timeEnd('\n\nbobamo is ready in');

    }.bind(this))
}

PluginManager.prototype.done = function(e,o){
    var all =  [];
    this.forEach(function(plugin){
        all.push(this.exec(plugin, 'done', e, o));
    }, this);

    return Q.allSettled(all);
}

PluginManager.prototype.save = function (plugin, data, callback, req) {
    this.persist.save(plugin.name, data, callback);
}

PluginManager.prototype.gentoken = function () {
    return  require('crypto').randomBytes(10).toString('hex');

}

PluginManager.prototype.configure = function () {
    var obj = this.persist.read(this.configFile);
    var plugins = obj && obj.plugins || {};
    var reconfigure = this.reconfigure = [];
    var all = [];
    var errors = {};
    this.forEach(function (plugin) {
        try {
            var p = plugin.configure(plugins[plugin.name]);
            all.push(Q.when(p).then(function (value) {
                //just checking for errors;
                if (!value)
                    return;
                reconfigure.push(plugin.name)
                errors[plugin.name] = value;
                console.log('error in configure', plugin.name, value);
            }, function (promise) {
                errors[plugin.name] = promise.valueOf().exception.message;
                reconfigure.push(promise.valueOf().name);
                console.log('error in configure', plugin.name, promise.valueOf().exception);

            }));
        } catch (e) {
            console.log(plugin.name, 'caught exception', e);
            errors[plugin.name] = e.message;
            reconfigure.push(plugin.name);
        }
    }, this);

    return Q.allSettled(all)
        .done(function () {
            if (reconfigure.length) {
                console.dir('errors',reconfigure, errors);
            }else{
                this.reconfigure = [];
                delete this.setupToken;
            }
        }.bind(this));
}
/**
 * Default plugins to load.
 */
PluginManager.prototype.defaultPlugins = [ 'static', 'appeditor', 'modeleditor',
    'renderer',
    'less', 'setup', 'generator', 'rest', 'mongoose', 'package' ];
/**
 *
 */
PluginManager.prototype.__defineGetter__('admin', function () {
    var admin = [];

    this.forEach(function (plugin) {
        var adm = plugin.admin(this.options);
        if (!_u.isUndefined(adm))
            admin = admin.concat(adm);
    });
    return admin;
});

PluginManager.prototype.__defineGetter__('editors', function () {
    var editors = [];

    this.forEach(function (plugin) {
        var edit = plugin.editors();
        if (edit)
            editors = editors.concat(edit);
    }, this);

    return editors;
});
PluginManager.prototype.__defineGetter__('renderers', function () {
    var renderers = {

    };

    this.forEach(function (plugin) {
        if (!plugin.renderers)
            return;
        var add = plugin.renderers();
        if (add && add.length)
            renderers[plugin.name] = add;
    }, this);

    return renderers;
});

/**
 * Load all plugin filters
 */
PluginManager.prototype.loadFilters = function () {
    this.forEach(function (plugin) {
        plugin.filters(this.options);
    });
};

PluginManager.prototype.forEach = function (func, ctx) {
    ctx = ctx || this;
    return Q.allSettled(this.plugins.map(function (plugin, i) {
        if (typeof func == 'function') {
            return func.call(ctx, plugin, i);
        } else if (typeof plugin[func] == 'function') {
            return plugin[func] && plugin[func].call(ctx, plugin, i);
        } else{
            return plugin[func];
        }
    }));
};
/**
 *
 * @param plugin //plugin to use
 * @param method
 */
PluginManager.prototype.exec = function (plugin, method) {
    var args = pslice.call(arguments, 2);
    if (plugin && method) {
        plugin = _u.isString(plugin) ? this.loadedPlugins[plugin] : plugin;
        method = _u.isFunction(method) ? method : plugin[method];
        if (plugin && method) {
            return  method.apply(plugin, args);
        }
    }
};

/**
 * Returns an array of results of calling the method
 * or property value if not a method on each plugin if
 * said property exists on the plugin.
 *
 * If an array is
 * returned from either it is flattened in the return
 *
 * with arg1,arg2...
 *
 * @param {String|Function} method
 * @param  [args] to be passed into the method that is called.
 */
PluginManager.prototype.asList = function (method, args) {
    var args = pslice.call(arguments, 1);

    var ret = [];
    this.forEach(function (plugin) {
        var ref = plugin[method];
        if (_u.isUndefined(ref))
            return;
        _addAll(ret, _u.isFunction(ref) ? ref.apply(plugin, args) : ref);
    });

    return ret;
}

var _doAdd = function (v) {
    if (v == null || v === undefined) return;
    return psplice.apply(this, [this.length, v.length].concat(v));
};

var _addAll = function (dest, src) {
    dest = dest || []
    pslice.call(arguments, 1).forEach(_doAdd, dest);
    return dest;
};
/**
 * Load all appmodels.
 */
PluginManager.prototype.loadAppModels = function () {
    return this.forEach(function (plugin) {
        this.appModel.add(plugin.appModel(this.options))
    }, this);
}
/**
 * Loads all routes.
 */
PluginManager.prototype.loadRoutes = function () {
    return this.forEach(function (plugin) {
        plugin.routes(this.options);
    });
};

/**
 * Checks to make sure plugin inherits from PluginAPI
 * @param clz
 * @returns {boolean}
 */
function isPluginApi(clz) {
    var _super = clz._super;
    while (_super) {
        if (_super == PluginApi)
            return true;
        _super = _super._super;
    }
    return false;
}
/**
 *
 * @param options is an object that can contain {
 *   pluginDirs:[]/*only these directories will be searched/
 *   pluginDir:[]/* add these directories to search path
 *   plugins:[]/*plugins to load
 * }
 * @param express
 */
PluginManager.prototype.loadPlugins = function (options, express) {
    //bus.emit('plugin-manager.loadPlugins.before', options, express);

    var defDirs = [path.join(path.dirname(module.filename), '../plugins'), path.join(process.cwd(), '../plugins')];
    var dirs = options.pluginDirs || options.pluginDir && [].concat(options.pluginDir).concat(defDirs) || defDirs;

    var plugins = options.plugins || options.plugin && [].concat(options.plugin).concat(this.defaultPlugins) || this.defaultPlugins;
    if (options.extraPlugins) {
        plugins = plugins.concat(options.extraPlugins);
    }
    var loaded = {};
    var ret = [];
    _u.unique(plugins).forEach(function (pdir) {
        if (_u.isFunction(pdir)) {

            var plugin = isPluginApi(pdir) ? new pdir(options, express, null, null, this) : pdir(options, express, null, null, this);

            ret.push(plugin);
            loaded[plugin.name || pdir] = true;

        } else {

            if (loaded[pdir]) {
                console.warn('plugin already loaded [' + pdir + ']');
                return;
            }

            _u.unique(dirs).forEach(function (dir) {
                if (!fs.existsSync(dir)) {
                    return;
                }
                var fpath = path.join(dir, pdir, pdir + '.js');
                if (fs.existsSync(fpath)) {
                    console.log('loading ', fpath);
                    try {
                        var Plugin = require(fpath);
                        // bus.emit('plugin-manager.loadPlugins.before.'+pdir, plugin);
                        var plugin = new Plugin(options, express, pdir, path.join(dir, pdir), this);

                        ret.push(plugin);
                        loaded[pdir] = plugin;
                        //bus.emit('plugin-manager.loadPlugins.after.'+pdir, plugin);


                    } catch (e) {
                        console.warn('error loading plugin [' + fpath + ']', e);
                    }
                }
            }, this);
        }
    }, this);

    _u(plugins).difference(Object.keys(loaded)).forEach(function (v) {
        console.warn('did not load plungin [' + v + ']');
        // bus.emit('plugin-manager.loadPlugins.failed', v,k);
    });
    _u(plugins).each(function (v) {
        ret[v.name] = v;
    });
    // bus.emit('plugin-manager.loadPlugins.after', options, express);
    return ret;
};

/**
 * Goes through plugins to determine if they can help build the app model.
 *
 * @param path
 * @param property
 * @param object
 */
PluginManager.prototype.pluginFor = function (path, property, object) {
    for (var i = 0, l = this.plugins.length; i < l; i++) {
        var field = this.plugins[i].editorFor(path, property, object);
        if (field) {
            return field;
        }
    }
    return null;
}
PluginManager.prototype.editorsFor = function (path, property, object) {
    return _u.map(this.plugins, function (v) {
        return v.editorFor(path, property, object);
    });
}

PluginManager.prototype.pluginNames = function () {
    return _u.pluck(this.plugins, 'name');
};

/**
 *
 * Updates the schema by default to mongoose.
 * @param {Plugin} plugin
 * @param {String} modelName
 * @param {Schema} backboneSchema
 * @param {Function} callback
 */
PluginManager.prototype.updateSchema = function (plugin, modelName, backboneSchema, callback) {
    var args = pslice.call(arguments);
    if (arguments.length == 3) {
        args.unshift('mongoose');
    } else if (!plugin) {
        args[0] = 'mongoose';
    }

    plugin = this.loadedPlugins[args.shift()] || plugin;
    plugin.updateSchema.apply(plugin, args);
};

PluginManager.prototype.schemaFor = function (schema) {
    return this.loadedPlugins['mongoose'].schemaFor(schema);

};

/**
 * Tries to find a validator for a particular name / config.  Goes
 * through all the plugins call plugin.validator(name) and returns
 * them.   For Something to validate it has to pass all the validation
 * It short circuits on the first function to return false;
 * @return {Object}
 * @param validators
 */
var Valid = function (validators) {
    var self = this;
    self.messages = [];
    this.validator = function (value) {
        var args = pslice.call(arguments);

        return _u.find(validators, function (v) {
            var ret = v.apply(this, args);
            if (ret) {
                self.messages.push(ret.message);
                return false;
            }
            return true;
        }, this) != null;

    };

    this.msg = {
        toString: function () {
            return  self.messages.join(',');
        }
    }
}

PluginManager.prototype.validator = function (name, vals) {
    var validators = [];
    _u.each(this.plugins, function (v) {
        _u.each(v.validators(), function (vv) {
            if (vv.type == name) {
                validators.push(vv.validator(vals));
            }
        });
    })
    if (validators.length) {
        // var valid = new Valid(validators);
        var messages = [];
        return {validator: function (value) {
            var args = pslice.call(arguments);

            var valid = _u.find(validators, function (v) {
                var ret = v.apply(this, args);
                if (ret) {
                    messages.push(ret.message);
                    return false;
                }
                return true;
            }, this) != null;

            return valid;
        }, msg: {
            toString: function () {
                return messages.join(',')
            }
        }, type: name};
    }

    return {
        validator: function () {
            return true;
        }
    };
}

module.exports = PluginManager;


