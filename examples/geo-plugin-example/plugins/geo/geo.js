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
GeoPlugin.prototype.clientConfig = {
    apiKey:'AIzaSyBXNh3-mlasFlUAjiLKqIG6bCvW_7E8aMc',
    default:{
        lng:-77.0239019 , lat: 38.893738
    }
}