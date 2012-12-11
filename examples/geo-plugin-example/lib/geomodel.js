var geocoder = require('geocoder'), bobamo = require('bobamo'), mongoose = bobamo.mongoose;

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
});

var config = {};

AddressSchema.statics.search = function (q) {
    // P.find({pos : { $near : [ 50, 20], $maxDistance: 30 }} , function(err, docs){

    var near = q.near || {};
    var query = {location:{ $near:_.map([near.lon || 0, near.lat || 0], parseFloat), $maxDistance:q.maxDistance / 69.047 }}
    console.log('searching', query);

    return this.find(query);
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
    ]
}
var Address = mongoose.model('Address', AddressSchema);
module.exports = Address;