var bobamo = require('bobamo'), mongoose = bobamo.mongoose, PluginApi = bobamo.PluginApi, util = require('util'), _u = require('underscore');


var GeoPoint = function GeoPoint(path, options) {
    options = _u.extend({type:Object, index:'2d', strict:true}, options);
    this.lon = Number;
    this.lat = Number;
    this.formatted_address = String;
    GeoPoint.super_.call(this, path, options);
    console.log('geopoint', this);
};

util.inherits(GeoPoint, mongoose.Schema.Types.Object);

GeoPoint.prototype.cast = function (test, obj) {
   // console.log('cast', arguments, this);
    return test;
}
exports.GeoPoint = GeoPoint;

mongoose.Types.GeoPoint = GeoPoint;

mongoose.Schema.Types.GeoPoint = GeoPoint;

GeoPoint.prototype.display = {


}
var GeoPlugin = function () {
    PluginApi.apply(this, arguments);
}
util.inherits(GeoPlugin, PluginApi);
module.exports = GeoPlugin;
GeoPlugin.prototype.editors = function () {
    return [
        {
            types:['GeoPoint'],
            name:'MapEditor',
            schema:{
                defaults:{
                    type:'LocationEditor'
                }
            },
            fields:['lat', 'lon']
        },
        {
            types:['GeoPoint'],
            name:'LocationEditor',
            schema:{
                defaults:{
                    type:'LocationEditor'
                }
            }
        }
    ]
}
GeoPlugin.prototype.editorFor = function (path, property, Model) {
    if (property.type == 'GeoPoint' || (property.lat && property.lon)) {
        return {
            type:'LocationEditor',
            schemaType:'GeoPoint',
            labelAttr:'formatted_address'
        }
    }
}

GeoPlugin.prototype.clientConfig = {
    apiKey:'AIzaSyBXNh3-mlasFlUAjiLKqIG6bCvW_7E8aMc',
    default:{
        lon:-77.0239019, lat:38.893738
    }
}
