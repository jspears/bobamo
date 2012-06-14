var mongoose = require('mongoose'), Schema = mongoose.Schema;

var ImageInfoSchema = new Schema({
    name:{type:String},
    size:{type:Number},
    width:{type:Number},
    height:{type:Number},
    created_at:{type:Date, default:Date.now},
    fileId:{type:String},
    type:{type:String}

});

module.exports = ImageInfoSchema;
//module.exports = mongoose.model('ImageInfo', ImageInfoSchema);


