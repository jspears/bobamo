var path = require('path'), _u = require('underscore'), DisplayModel = require('./display-model');
/**
 *
 * @param options  // options to use
 * @param express // an app instance.
 */
var PluginManager = function (options, express) {
    this.options = _u.extend({}, options);
    this.plugins = this.loadPlugins(this.options, express);
    this.appModel = new DisplayModel(this.options);
    this.loadAppModels();
    this.loadFilters();
    this.loadRoutes();
}
/**
 * Default plugins to load.
 */
PluginManager.prototype.defaultPlugins = ['less', 'modeleditor', 'appeditor', 'rest', 'generator', 'mongoose', 'static', 'package'];
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

PluginManager.prototype.loadPlugins = function (options, express) {
    var dirs = options.pluginDirs || [path.join(path.dirname(module.filename), '../plugins'), path.join(process.cwd(), '../plugins')].concat(options.pluginDir || [])
    var plugins = options.plugins || this.defaultPlugins;
    var loaded = {};
    var ret = [];
    dirs.forEach(function (dir) {
        if (!path.existsSync(dir))
            return;
        try {
            plugins.forEach(function (pdir) {
                if (loaded[pdir]) {
                    console.warn('plugin already loaded [' + pdir + ']');
                    return;
                }

                var fpath = path.join(dir, pdir, pdir + '.js');
                if (path.existsSync(fpath)) {
                    console.log('loading ', fpath);
                    try {
                        var Plugin = require(fpath);
                        var plugin = new Plugin(options, express, pdir, path.join(dir, pdir), this);
                        ret.push(plugin);
                        loaded[pdir] = true;
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
    }, this);

    _u(plugins).difference(Object.keys(loaded)).forEach(function (v, k) {
        console.warn('did not load plungin [' + v + ']');
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


module.exports = PluginManager;


