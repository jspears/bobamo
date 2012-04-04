var geocoder = require('geocoder');
var mongoose = require('mongoose');
var AddressSchema = new mongoose.Schema({
    name        : {type: String, default : ''},
    street1     : {type: String, default : ''},
    street2     : {type: String, default : ''},
    city        : {type: String, default : '', required: true},
    state       : {type: String, required : true},
    zip         : {type: String, default : ''},
    country     : {type: String},
    location    : {lng: Number, lat:Number},
    type        : {type: String, enum:['agent', 'agency', 'registrant'], index:true},
    primary     : {type: Boolean, default: false}
});
var Address = mongoose.model('Address', AddressSchema);
Address.prototype.geocode = function(cb){
    var self = this;
    geocoder.geocode(self.full, cb, function(err, data){
        var rloc = data.results[0].geometry.location;
        self.location = {lng: rloc.lng, lat: rloc.lat};
        cb(err,data);
    })
}
module.exports = Address;