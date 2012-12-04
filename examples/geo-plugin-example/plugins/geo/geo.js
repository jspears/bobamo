var bobamo = require('bobamo'), mongoose= bobamo.mongoose, PluginApi = bobamo.PluginApi, util = require('util');


var GeoPoint = function GeoPoint(path, options) {
    options.display = {
        type:'MapEditor'
    }
    GeoPoint.super_.call(this, path, options);

};

util.inherits(GeoPoint, mongoose.Schema.Types.Mixed);
GeoPoint.prototype.display  = {
    type:'MapEditor'
}
exports.GeoPoint = GeoPoint;

mongoose.Types.GeoPoint = Object;
mongoose.Schema.Types.GeoPoint = GeoPoint;


var GeoPlugin = function () {
    PluginApi.apply(this, arguments);
}
util.inherits(GeoPlugin, PluginApi);
module.exports = GeoPlugin;
GeoPlugin.prototype.editors = function () {
    return ['MapEditor']
}
GeoPlugin.prototype.editorFor = function (path, property, Model) {
    if (property && property.lat && property.lng) {
        return {
            type:'MapEditor',
            subSchema:{
                lat:{type:'Hidden'},
                lng:{type:'Hidden'}
            }
        }
    }
}
GeoPlugin.prototype.types = function(dbType){
    return {
                schemaType:'GeoPoint',
                type:'MapEditor',
                subSchema:{
                    lat:{type:'Hidden'},
                    lng:{type:'Hidden'}
                }
            }
}
GeoPlugin.prototype.clientConfig = {
    apiKey:'AIzaSyBXNh3-mlasFlUAjiLKqIG6bCvW_7E8aMc',
    default:{
        lng:-77.0239019, lat:38.893738
    }
}
