var _u = require('underscore'), path = require('path'), static = require('connect/lib/middleware/static');
var cleanRe = /([\/]*)?(.*)([\/]*)?/;
function cleanurl(str) {
    return str && str.replace(/(^[\/]*)/, '').replace(/\/{2,}/, '/').replace(/([\/]*)$/, '/')
}
/**
 * A Plugin interface.   This is just a helper,
 * to ensure everything can work alright.  PluginManager
 * does not check type.
 *
 * @param options
 * @param app //express
 * @param name //name of plugin defaults to basename(path)
 * @param path //path defaults basename(dirname(module.parent.filename))
 * @param pluginManager // a reference to the pluginManager.
 */
var Plugin = function (options, app, name, p, pluginManager) {
    this.pluginManager = pluginManager;
    this.path = p;
    this.options = _u.extend({}, options);
    var _baseUrl;
    this.__defineSetter__('baseUrl', function (val) {
        _baseUrl = val == '/' ? val : val && '/' + cleanurl(val) || '/';
    });
    this.baseUrl = this.options.baseUrl;
    this.name = name || this.options.name || path.basename(path.dirname(module.parent.filename));
   if (this.pluginManager && this.pluginManager.requireConfig)
    this.pluginManager.requireConfig.paths[this.name] = path.join(this.path, 'public', 'js');
    this.__defineGetter__('baseUrl', function () {
        var ret = _baseUrl;
        return ret;
    });
    this.app = app;
}
Plugin.prototype.configure = function (conf, req) {

}

Plugin.prototype.local = function (res, key, value) {
    if (_u.isFunction(res.local)) {
        return arguments.length < 3 ? res.local(key) : res.local(key, value);
    } else {
        if (arguments.length < 3) {
            return res.locals[key];
        } else {
            return (res.locals[key] = value)
        }
    }

}
Plugin.prototype.__defineGetter__('pluginUrl', function () {
    var ret = this.options.pluginUrl || this.baseUrl + this.name;
    return ret;
});

//Returns a display-model if it can.
Plugin.prototype.appModel = function () {

}

Plugin.prototype.save = function onPluginSave(conf, callback, req) {
    this.pluginManager.save(this, conf, callback, req);
}

Plugin.prototype.defaultEngine = 'jqtpl';
Plugin.prototype.header = function () {

}
Plugin.prototype._setupLocals = function(req,res,next){
    var locals = {
        pluginUrl:this.pluginUrl,
        baseUrl:this.baseUrl,
        plugin:this
    }
    if (_u.isFunction(res.local)) {
        _u.each(locals, function (v, k) {
            res.local(k, v);
        });
    } else {
        _u.extend(res.locals, locals);
    }
    next();
}
/**
 * Adds filters before routes, in gives a shot
 * to filtering things before swallowing the request.
 * @param options
 */
Plugin.prototype.filters = function (options) {

    var sdir = path.join(this.path, 'public');
    var psdir = path.join(this.path, '../../', 'public/plugins', this.name);
    console.log('public dirs', sdir, psdir);
    var public = static(sdir);
    var publicUser = static(psdir);
    var setupPluginLocals = this._setupLocals.bind(this);

    this.app.all(this.pluginUrl + '*', setupPluginLocals);
    this.app.all(this.baseUrl + 'js/' + this.name + '/*', setupPluginLocals);
    this.app.all(this.baseUrl + 'tpl/' + this.name + '/*', setupPluginLocals);
    this.app.all(this.baseUrl + 'template/' + this.name + '/*', setupPluginLocals);


    this.app.get(this.baseUrl + 'js/libs/editors/*', function (req, res, next) {
        req._url = req.url;
        req.url = req.url.substring(this.baseUrl.length);
        next();
    }.bind(this), public, publicUser, function (req, res, next) {
        req.url = req._url;
        next();
    });

    var resetUrl = function (req, res, next) {
        req.url = req._url;
        next();
    }
    /**
     * Allow static content from /<plugin>/, /js/<plugin>, /tpl/<plugin>,/templates/<plugin> to be served
     */
     var urls = [this.pluginUrl,
      this.baseUrl + 'js/' + this.name + '/',
      this.baseUrl + 'tpl/' + this.name + '/',
      this.baseUrl + 'templates/' + this.name + '/'
      ];
     urls.forEach(function (v, k) {
                this.app.get(v + '*', function (req, res, next) {
                    req._url = req.url;
                    req.url = req.url.substring(v.length);
                    next();
                }, public, publicUser, resetUrl);
      }, this);

}
/**
 * Adds routes to the app, after the model and filter have been applied.
 * @param routes
 */
Plugin.prototype.routes = function (routes) {
    var prefix = this.pluginUrl;
    var setupPluginLocals = this._setupLocals.bind(this);

    var jsView = this.baseUrl + 'js/views/' + this.name;
    var saveConfig = function (req, res, next) {
        this.save(req.body, function (resp) {
            this.configure(req.body);
            res.send({
                status:0,
                payload:resp
            });
        }.bind(this))
    }.bind(this);
    this.app.post(prefix + '/admin/configure', saveConfig);
    this.app.put(prefix + '/admin/configure', saveConfig);
    this.app.get(prefix + '/admin/configure', function (req, res, next) {
        res.send(this.config || {});
    }.bind(this));
    this.app.get(prefix + '*', setupPluginLocals, function (req, res, next) {
        this.generate(res, req.url.substring(prefix.length));
    }.bind(this));

    this.app.get(jsView + '/*', setupPluginLocals, function (req, res, next) {
        var view = req.url.substring(jsView.length);
        this.generate(res, view);
    }.bind(this))

    var jsConfig = this.baseUrl + 'js/config/' + this.name + '.js';
    //TODO - a little worried about security here... might think about breaking out client and server configurations out, or at least protecting them somehow.
    this.app.get(jsConfig,setupPluginLocals, function (req, res) {
        res.send(this.clientConfig);
    }.bind(this));


}
/**
 * Returns a list of editors that this plugin provides
 * [{
 *   type:'EditorName',
 *   editorSrc:''(optional defaults to /pluginUrl/editors/editor-name.js)
 *   description:'' //optional discription of editor
 * }]
 */
Plugin.prototype.editors = function () {
    return [];
}
/**
 * Determines the editor for a path.
 * @param path
 * @param property
 * @param model
 */
Plugin.prototype.editorFor = function (path, property, model) {

}
Plugin.prototype.editorsByType = function (string) {

}
/**
 * returns a function to format the output.
 */
Plugin.prototype.format = function () {
    //function(value, field, schema, object){
    //}
    return null
}
/**
 *
 * [{
 *    title: //optional name of plugin is used,
 *    description: //optional not displayed if not defined.
 *    url: //optional - path to admin ui default uses #/admin/(lowercase(plugin.name))
 * }]
 * @param admin a list of admin plugins, add yours if you want it in the admin menu.
 */
Plugin.prototype.admin = function (admin) {

}
/**
 * Helper function to create generators for paths.
 * @param res
 * @param view
 * @param options
 */
Plugin.prototype.generate = function (res, view, options, next) {
    var search = path.join(this.path, '/views/', view);
    res.render(search, _u.extend({relative:false, hint:true}, options, {layout:false, defaultEngine:this.defaultEngine, pluginUrl:this.pluginUrl}));
}
Plugin.prototype.validators = function (type) {
}
module.exports = Plugin;
