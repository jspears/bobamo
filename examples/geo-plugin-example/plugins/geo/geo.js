var bobamo = require('bobamo'), mongoose = bobamo.mongoose, PluginApi = bobamo.PluginApi, util = require('util'), _u = require('underscore');


var GeoPoint = function GeoPoint(path, options) {
    options = _u.extend({index:'2d', type:[Number]}, options);
//    options.type = [Number];
//    this.lat = Number;
//    this.lon = Number;
    GeoPoint.super_.call(this, path, options, function(){
        console.log("Im a caster");
    });
    console.log('geopoint', this);
};

util.inherits(GeoPoint, mongoose.Schema.Types.Array);

GeoPoint.prototype.cast = function(){

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
                lat:{type:'Number', help:'Default Latitude',  validators:[{type:'min', min:0}, {type:'max', max:181}]},
                lon:{type:'Number', help:'Default Longitude', validators:[{type:'min', min:0}, {type:'max', max:181}]}
            },
            fields:['lat','lon']
        },
        {
            types:['GeoPoint'],
            name:'LocationEditor',
            schema:{
                lat:{type:'Number', help:'Default Latitude',  validators:[{type:'min', min:0}, {type:'max', max:181}]},
                lon:{type:'Number', help:'Default Longitude', validators:[{type:'min', min:0}, {type:'max', max:181}]}
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
    default:{
        lng:-77.0239019, lat:38.893738
    }
}
