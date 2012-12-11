var  bobamo = require('bobamo'), mongoose = bobamo.mongoose;

var AddressSchema = new mongoose.Schema({
    name        : {type: String, default : ''},
//    street1     : {type: String, default : ''},
//    city        : {type: String, default : '', required: true},
//    state       : {type: String, required : true},
//    zip         : {type: String, default : ''},
//    country     : {type: String},
    location    : {type:'GeoPoint', display:{type:'LocationEditor'}}
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
AddressSchema.statics.search = function(q){
    // P.find({pos : { $near : [ 50, 20], $maxDistance: 30 }} , function(err, docs){

    var near = q.near || {};
    var query = {location:{ $near:[parseFloat(near.lon), parseFloat(near.lat)], $maxDistance:q.maxDistance / 69}};
    console.log('searching', query);
    return this.find(query);
};

AddressSchema.statics.search.display = {
    schema:{
        near:'LocationEditor',
        maxDistance:{
            type:'Select',
            options:[1,5,10,100]
        }
    },
    defaults:{
        near:{
            loc:-77.0988941,
            lan:38.8988834,
            formatted_address:'Arlington, VA'
        },
        maxDistance:5
    },
    fieldsets:[{legend:'Near', fields:['near','maxDistance']}]
}
AddressSchema.index({location:'2d'});
var Address = mongoose.model('Address', AddressSchema);

module.exports = Address;