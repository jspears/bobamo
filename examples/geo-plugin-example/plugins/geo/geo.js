var PluginApi = require('bobamo/lib/plugin-api'), util = require('util');

var GeoPlugin = function () {
    PluginApi.apply(this, arguments);
}
util.inherits(GeoPlugin, PluginApi);
module.exports = GeoPlugin;
GeoPlugin.prototype.editors = function(){ return ['GeoEditor']}
GeoPlugin.prototype.editorFor = function(path, property, obj){
    console.log('editor for', path,property);
}
GeoPlugin.prototype.routes = function(){

}
