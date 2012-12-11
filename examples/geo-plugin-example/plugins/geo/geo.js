var bobamo = require('bobamo'), mongoose = bobamo.mongoose, PluginApi = bobamo.PluginApi, util = require('util'), _u = require('underscore');


var GeoPoint = function GeoPoint(path, options) {
    options = _u.extend({index:'2d', type:Object, strict:true}, options);
    this.lon = Number;
    this.lat = Number;
    this.formatted_address = String;
    GeoPoint.super_.call(this, path, options);
};

util.inherits(GeoPoint, mongoose.Schema.Types.Object);

GeoPoint.prototype.cast = function(obj){
  console.log('cast ', arguments);
    return obj;
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
                lat:{type:'Number', help:'Default Latitude',  validators:[{type:'min', min:-180}, {type:'max', max:181}]},
                lon:{type:'Number', help:'Default Longitude', validators:[{type:'min', min:-180}, {type:'max', max:181}]}
            },
            fields:['lat','lon']
        },
        {
            types:['GeoPoint'],
            name:'LocationEditor',
            schema:{
                lat:{type:'Number', help:'Default Latitude',  validators:[{type:'min', min:-180}, {type:'max', max:181}]},
                lon:{type:'Number', help:'Default Longitude', validators:[{type:'min', min:-180}, {type:'max', max:181}]}
            },
            fields:['lat','lon']
        }
    ]
}
GeoPlugin.prototype.editorFor = function (path, property, Model) {
    if (property.type == 'GeoPoint' || (property.lat && property.lon)) {
        return {
            type:'LocationEditor',
            schemaType:'GeoPoint'
        }
    }
}

GeoPlugin.prototype.clientConfig = {
    apiKey:'AIzaSyBXNh3-mlasFlUAjiLKqIG6bCvW_7E8aMc',
    defaults:{
        lng:-77.0239019, lat:38.8799697
    }
}
