var _u = require('underscore');
var Plugin = exports.module = function (options, app) {
    this.baseUrl = baseUrl;
    this.options = _u.extend({}, options);
    this.app = app;
}

/**
 * @param routes //
 *      [{
 *      path:path, //optional - this.baseUrl+'/'+$(lowercase(plugin-name)}/*
 *      callback:function(req,res,next) //required context is Plugin.
 *      }]
 */

Plugin.prototype.routes = function (routes) {

}

/**
 * configures the editors array. Push your editors into it.
 * [{
 *      title:'NameOfEditor',
 *      path:'path to editor', //optional will look in plugin/public/js/web/libs/editors/${title}.js
 *      description:'',
 *      check:function(property, Model){} // returns int or true/false if the editor can be used with this type. Will decide weather to use it by default based on the value of the return to others that return. //optional.
 *  }]
 *
 *
 * @param editors - A reference to the systems Type editors.
 */
Plugin.prototype.editors = function(editors){

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
Plugin.prototype.admin = function(admin){

}