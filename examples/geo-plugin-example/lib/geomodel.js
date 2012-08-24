var geocoder = require('geocoder');
var mongoose = require('mongoose');

var AddressSchema = new mongoose.Schema({
    name        : {type: String, default : ''},
    street1     : {type: String, default : ''},
    city        : {type: String, default : '', required: true},
    state       : {type: String, required : true},
    zip         : {type: String, default : ''},
    country     : {type: String},
    location    : {lng: Number, lat:Number},
    type        : {type: String, enum:['agent', 'agency', 'registrant'], index:true},
    primary     : {type: Boolean, default: false},
    meta        : {
        favorite:Number,
        links:[
            {type:String}
        ],
        terms:[
            {
                label:{type:String},
                value:{type:Number}
            }
        ]
    }
});
var Address = mongoose.model('Address', AddressSchema);
var config = {};
var http_proxy = process.env['http_proxy'];
if (http_proxy){
    var re = /^http(s?):\/\//i;
    http_proxy = re.test(http_proxy) ? http_proxy : 'http://'+http_proxy;
    var url = require('url').parse(http_proxy );
    config.hostname = url.hostname;
    config.port = url.port;
    config.headers = {
        Host: 'maps.googleapis.com'
    }
    if (url.auth)
        config.headers["Proxy-Authorization"] = 'Basic ' + new Buffer(url.auth).toString('base64');

}
function join(delim){
   var ret = '';
    Array.prototype.slice.call(arguments, 1).forEach(function(v){
        if (v)
            ret +=delim+v;
    });
    return ret;
}
Address.prototype.geocode = function(next){
    var self = this;
    var schema = this.schema;
    var addr = join('+', this.street1, this.street2, this.city, this.state, this.zip);

    geocoder.geocode(addr, function(err, data){
        if (err) next();
        console.log('data',data);
        var rloc = data.results[0].geometry.location;
        self.location = {lng: rloc.lng, lat: rloc.lat};
        next(null, data);
    }, {}, {
        host:'proxy.ext.ray.com',
        port:80,
        headers: {
            Host:'maps.googleapis.com'
        }
    })

};
AddressSchema.pre('save', function(next){
    this.geocode(next);
});
module.exports = Address;