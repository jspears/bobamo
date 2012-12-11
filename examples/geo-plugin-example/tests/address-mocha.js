var mongoose = require('mongoose'), geo = require('../plugins/geo/geo'), Address = require('../lib/geomodel'), assert = require('assert');

mongoose.connect('mongodb://localhost/geomodel_development');

var lat = 38.8988834, lon = -77.0988949;
//var JunkSchema = new mongoose.Schema({
//    name:String,
//    geo:{
//        lon:Number,
//        lat:Number,
//        type:Object,
//        index:'2d'
//
//    }
//});
//var Junk = mongoose.model('junk', JunkSchema);
var Junk = mongoose.model('Address');
var J1 = {
    name:'J1',
    location:{lon:lon, lat:lat}
}, J2 = {
    name:'J2',
    location:{lon:12, lat:10}
}

new Junk(J1).save(
    function (err, obj) {
        new Junk(J2).save(function () {
            Junk.find({location:{$near:[lat, lon], $maxDistance:0.11}}).exec(function (e, o) {
                console.log('found', e, o);
                process.exit(0);
            });
        })
    })
