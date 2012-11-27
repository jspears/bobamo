var path = require('path'), _u = require('underscore'), DisplayModel = require('./display-model'), PluginApi = require('./plugin-api'), FilePersistence = require('./file-persistence');
/**
 *
 * @param options  // options to use
 * @param express // an app instance.
 */
var PluginManager = function (options, express) {
    this.options = _u.extend({}, options);
    this.configFile = this.options.configFile || path.join(process.cwd(), 'conf', 'bobamo.json');
    this.persist = options.persist || new FilePersistence(this.configFile);
    this.plugins = this.loadPlugins(this.options, express);
    var loaded =  this.loadedPlugins  = options.loadedPlugins = {};
    _u.each(this.plugins,function(v,k){
        loaded[v.name] = v;
    }, this);
    this.appModel = new DisplayModel(this.options);
    this.loadAppModels();
    this.loadFilters();
    this.loadRoutes();
    this.configure();
}

PluginManager.prototype.save = function (plugin, data, callback, req) {
    this.persist.save(plugin.name, data, callback, req);
}

PluginManager.prototype.configure = function (req) {
    var obj = this.persist.read(this.configFile, req)
    if (obj && obj.plugins)
        this.plugins.forEach(function (plugin) {
            plugin.configure(obj.plugins[plugin.name]);
        }, this)
}
/**
 * Default plugins to load.
 */
PluginManager.prototype.defaultPlugins = [ 'static', 'appeditor', 'modeleditor', 'less', 'generator', 'rest', 'mongoose',  'package'];
/**
 *
 */
PluginManager.prototype.__defineGetter__('admin', function () {
    var admin = [];

    this.plugins.forEach(function (plugin) {
        var adm = plugin.admin(this.options);
        if (!_u.isUndefined(adm))
            admin = admin.concat(adm);
    }, this);
    return admin;
});

PluginManager.prototype.__defineGetter__('editors', function () {
    var editors = [];

    this.plugins.forEach(function (plugin) {
        var edit = plugin.editors();
        if (edit)
            editors = editors.concat(edit);
    }, this);

    return editors;
});
/**
 * Load all plugin filters
 */
PluginManager.prototype.loadFilters = function () {
    this.plugins.forEach(function (plugin) {
        plugin.filters(this.options);
    }, this);
}
/**
 * Load all appmodels.
 */
PluginManager.prototype.loadAppModels = function () {
    this.plugins.forEach(function (plugin) {

        this.appModel.add(plugin.appModel(this.options))
    }, this);

}
/**
 * Loads all routes.
 */
PluginManager.prototype.loadRoutes = function () {
    this.plugins.forEach(function (plugin) {
        plugin.routes(this.options);
    }, this);

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
function isPluginApi(clz) {
    var _super = clz._super;
    while (_super) {
        if (_super == PluginApi)
            return true;
        _super = _super._super;
    }
    return false;
}
PluginManager.prototype.loadPlugins = function (options, express) {
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
                if (!path.existsSync(dir)) {
                    return;
                }
                var fpath = path.join(dir, pdir, pdir + '.js');
                if (path.existsSync(fpath)) {
                    console.log('loading ', fpath);
                    try {
                        var Plugin = require(fpath);
                        var plugin = new Plugin(options, express, pdir, path.join(dir, pdir), this);

                        ret.push(plugin);
                        loaded[pdir] = plugin;
                    } catch (e) {
                        console.warn('error loading plugin [' + fpath + ']', e);
                    }
                }
            }, this);
        }
    }, this);

    _u(plugins).difference(Object.keys(loaded)).forEach(function (v, k) {
        console.warn('did not load plungin [' + v + ']');
    });
    _u(plugins).each(function(v,k){
        ret[v.name] =v;
    });
    return ret;
}
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
}
PluginManager.prototype.editorsFor = function(path,property, object){
    return _u.map(this.plugins, function(v){
         return v.editorFor(path,property,object);
    });
}

PluginManager.prototype.pluginNames = function(){
    return _u(this.plugins).map(function(plugin){ return plugin.name});
}

/**
 * Updates schema based on dbType, example by default it is mongoose.
 * @param plugin(String|Function)  -- defaults to mongoose.
 * @param modelName
 * @param body
 * @param cb - optional;
 */
PluginManager.prototype.updateSchema = function(plugin, modelName, backboneSchema, callback){
    var args = _u.toArray(arguments);
    if (arguments.length == 3){
        args.unshift('mongoose');
    }else if (!plugin){
        args[0] = 'mongoose';
    }

    plugin = this.loadedPlugins[args.shift()] || plugin;
    plugin.updateSchema.apply(plugin, args);
}
PluginManager.prototype.schemaFor = function(schema){
    return this.loadedPlugins['mongoose'].schemaFor(schema);

}

/**
 * Tries to find a validator for a particular name / config.  Goes
 * through all the plugins call plugin.validator(name) and returns
 * them.   For Something to validate it has to pass all the validation
 * It short circuits on the first function to return false;
 * @param name
 * @return {Object}
 */

PluginManager.prototype.validator = function(name){
    var validators = [];
    _u.each(this.plugins, function(v,k){
           var validator = v.validator && v.validator(name);
           if (validator)
            validators.push(validator);
    })
    if (validators.length){
        return {
            validators:validators,
            validator:function(value){
               var args = _u.toArray(arguments);
              return _u.find(validators, function(v){
                   return v.apply(this, args) === false;
               }, this) != null;
            }
        }
    }

    return {
        validator:function(){
            return true;
        }
    }
}

module.exports = PluginManager;


