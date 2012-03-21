var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GroupSchema = new Schema({
    name:{type:String, unique:true, index:true, required:true},
    description:{type:String},
    created_at:{type:Date},
    modified_at:{type:Date}
},{display:{labelAttr:'name'}});

GroupSchema.pre('save', function (next) {
    if (this.isNew) {
        this.created_at = Date.now();
    } else {
        this.modified_at = Date.now();
    }
    next();
});
var Group = mongoose.model('group', GroupSchema);
module.exports = Group;
