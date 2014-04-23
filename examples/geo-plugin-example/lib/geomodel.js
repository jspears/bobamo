var bobamo = require('bobamo'), mongoose = bobamo.mongoose, _u = require('underscore'), Query = require('bobamo/node_modules/mers/lib/callback-query');

var AddressSchema = new mongoose.Schema({
    name:{type:String, default:''},
//    street1     : {type: String, default : ''},
//    city        : {type: String, default : '', required: true},
//    state       : {type: String, required : true},
//    zip         : {type: String, default : ''},
//    country     : {type: String},
    location:{type:'GeoPoint', display:{type:'LocationEditor'}}
    //,
//    type        : {type: String, enum:['agent', 'agency', 'registrant'], index:true},
//    primary     : {type: Boolean, default: false},
//    meta        : {
//        favorite:Number,
//        links:[
//            {type:String}
//        ],
//        terms:[
//            {
//                label:{type:String},
//                value:{type:Number}
//            }
//        ]
//    }
}, {display:{list_fields:['name','location.formatted_address', 'location']}});

var config = {};

//AddressSchema.statics.search = function (q) {
//    // P.find({pos : { $near : [ 50, 20], $maxDistance: 30 }} , function(err, docs){
//
//    var near = q.near || {};
//    var query = {location:{ $near:_u.map([near.lon || 0, near.lat || 0], parseFloat), $maxDistance:q.maxDistance / 69.047 }}
//    console.log('searching', query);
//
//    return this.find(query);
//};
var MILE_DEGREE = 69.047;
AddressSchema.statics.search = function (q) {
    var collection = this.collection;
    var lon = parseFloat(q.near.lon), lat = parseFloat(q.near.lat);
    return new Query(function(callback){
        var _this = this;
        collection.geoNear(lon,lat, _u.extend(this.options, {maxDistance:parseFloat(q.maxDistance)/MILE_DEGREE, distanceMultiplier:MILE_DEGREE}) , function (err, result) {
                err = err || result && result.errmsg ? result : null;
                if (err) {
                    return callback(err, null);
                }
                var res = _u.map(result.results, function (o) {
                    return _u.extend({dis:o.dis}, o.obj);
                });
                 _this._count = result.stats.objectsLoaded
                 _this._results = res;
                callback(null, res);
            });
    });
};

AddressSchema.statics.search.display = {
    schema:{
        near:'LocationEditor',
        maxDistance:{
            type:'Select',
            options:[1, 2, 5, 10, 100]
        }
    },
    defaults:{
        maxDistance:5,
        near:{
            formatted_address:'1616 N Fort Myer Dr, Arlington, VA 22209, USA',
            lon:-77.0239019,
            lat:38.893738
        }

    },
    events:{
        'near:change':'onFormSubmit',
        'maxDistance:change':'onFormSubmit'
    },
    buttons:[
        {
            type:'<button/>',
            href:'#map/map',
            html:'<b class="icon-map-marker"/>Map',
            clsNames:'btn map open-modal'
        },
        '<button type="submit" class="btn pull-right btn-primary save finish">Submit</button>'
    ],
    fieldsets:[
        {legend:'Near', fields:['near', 'maxDistance']}
    ],
    list_fields:['name', 'location.formatted_address', 'dis']
}
//var Address = mongoose.model('Address', AddressSchema);
module.exports = AddressSchema;
