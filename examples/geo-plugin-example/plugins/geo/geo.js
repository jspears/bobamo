var PluginApi = require('bobamo/lib/plugin-api'), util = require('util');

var GeoPlugin = function () {
    PluginApi.apply(this, arguments);
}
util.inherits(GeoPlugin, PluginApi);
module.exports = GeoPlugin;
GeoPlugin.prototype.editors = function(){ return ['GeoEditor']}
GeoPlugin.prototype.editorFor = function(path, property, Model){
//    console.log('editor for', path,property);
//    if (path == 'location')
    if (property && property.lat && property.lng){
            return {
                type:'MapEditor',
                subSchema:{
                    lat:{type:'Hidden'},
                    lng:{type:'Hidden'}
                }
            }
    }
}
GeoPlugin.prototype.routes = function(){

}
