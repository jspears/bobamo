var PluginApi = require('bobamo').PluginApi, util = require('util');

var GeoPlugin = function () {
    PluginApi.apply(this, arguments);
}
util.inherits(GeoPlugin, PluginApi);
module.exports = GeoPlugin;
GeoPlugin.prototype.editors = function(){ return ['MapEditor']}
GeoPlugin.prototype.editorFor = function(path, property, Model){
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
