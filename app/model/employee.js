var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EmployeeSchema = new Schema({
    email:{type:String, unique:true, index:true},
    firstName:{type:String},
    lastName:{type:String},
    twitterId:{type:String},
    officePhone:{type:String},
    cellPhone:{type:String},
    description:{type:String},
    title:{type:String},
    manager:{type:Schema.ObjectId, ref:"employee"},
    reports:[{type:Schema.ObjectId, ref:"employee"}],
    created_at:{type:Date},
    modified_at:{type:Date}
});

EmployeeSchema.pre('save', function (next) {
    if (this.isNew) {
        this.created_at = Date.now();
    } else {
        this.modified_at = Date.now();
    }
    if (this.reports){
        var self = this;
        this.reports.forEach(function(v,k){
            Employee.findOne({_id:v}).populate('reports').run(function(err,obj){
                obj.manager = self;
                obj.save();
            });
        }, this)
    }
    next();
});
EmployeeSchema.statics.search= function(q){
   var regex = {$regex:new RegExp(q.term, 'i')}
   return this.find({}).or([ {firstName:regex},{lastName:regex},{twitterId:regex},{description:regex} ]);

}
var Employee = mongoose.model('employee', EmployeeSchema);
module.exports = EmployeeSchema;
