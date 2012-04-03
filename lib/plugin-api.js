var _u = require('underscore'), path = require('path'), static = require('connect/lib/middleware/static');
var cleanRe = /([\/]*)?(.*)([\/]*)?/;
function cleanurl(str) {
    return str && str.replace(/(^[\/]*)/, '').replace(/\/{2,}/, '/').replace(/([\/]*)$/, '/')
}
var Plugin = function (options, app, name) {

    this.options = _u.extend({}, options);
    var _baseUrl;
    this.__defineSetter__('baseUrl', function (val) {
        _baseUrl = val && '/' + cleanurl(val);
    });
    this.baseUrl = options.baseUrl;
    var fname = module.parent.filename;
    this.name = name || this.options.name || path.basename(path.dirname(fname));

    this.__defineGetter__('baseUrl', function () {
        var ret =  _baseUrl || '/';
        return ret;
    });
    //var pluginUrl = options.pluginUrl;


    this.__defineGetter__('pluginUrl', function () {
        var ret = this.options.pluginUrl || this.baseUrl + this.name;
        return ret;
    });

    this.app = app;
}
//Returns a display-model if it can.
Plugin.prototype.appModel = function(){

}
/**
 * Adds filters before routes, in gives a shot
 * to filtering things before swallowing the request.
 * @param options
 */
Plugin.prototype.filters = function(options){

}
/**
 * @param routes //
 *      [{
 *      path:path, //optional - this.baseUrl+'/'+$(lowercase(plugin-name)}/*
 *      callback:function(req,res,next) //required context is Plugin.
 *      }]
 */

Plugin.prototype.routes = function (routes) {
    var prefix = this.pluginUrl;
    var sdir = path.join(path.dirname(module.parent.filename), 'public');
    var psdir = path.join(process.cwd(), 'public/plugins', this.name);
    console.log('sdir', sdir, psdir);
    var public = static(sdir);
    var publicUser = static(psdir);

    this.app.get(prefix + '*', function (req, res, next) {
            req._url = req.url;
            req.url = req.url.substring(prefix.length - 1);
            next();

        }, public, publicUser, function (req, res, next) {
            req.url = req._url;
            next();
        },

        function (req, res, next) {
            this.generate(res, req.url);
        }.bind(this))
}
Plugin.prototype.models = function(){

}
/**
 * Returns a list of editors that this plugin provides
 * [{
 *   type:'EditorName',
 *   editorSrc:''(optional defaults to /pluginUrl/editors/editor-name.js)
 * }]
 */
Plugin.prototype.editors = function () {
    return [];
}
/**
 * Returns null if it can not create an editor for a particular
 * property of an object.
 *
 * Returns an object for the model if it can
 * {
 *   type:"EditorName",
 *   editorSrc:''(optional defaults to /pluginUrl/editors/editor-name.js)
 *   help:''//optional
 *   title:''//optional will default to humanized key value.
 *   subObject://optional if it is a nested path property will have a dot in it.
 *
 * }
 *
 * @param editors - A reference to the systems Type editors.
 */
Plugin.prototype.editorFor = function (path, property, model) {

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
Plugin.prototype.generate = function (res, view, options) {
    var search = path.join(path.dirname(module.parent.filename), '/views/', view);
    res.render(search, _u.extend({relative:false}, options, {layout:false}));
}
module.exports = Plugin;