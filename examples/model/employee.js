var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var EmployeeSchema = new Schema({
    firstName:{type:String},
    lastName:{type:String},
    title:{type:String},
    department:{type:String},
    officePhone:{type:String},
    cellPhone:{type:String},
    email:{type:String},
    city:{type:String},
    picture:{type:String},
    twitterId:{type:String,validate: /^@[a-zA-Z0-9]*$/i },
    blogUrl:{type:String},
    manager:{type:Schema.ObjectId, ref:"employee"}, //keep track of the employee
    reports:[
        {type:Schema.ObjectId, ref:"employee"} //keep track of the reports.
    ]
}, {
    display:{
        fieldsets:[
            {legend:'Identity',  help:'Enter your identity information here.', fields:['firstName','lastName','title', 'department']},
            {legend:'Contact', fields:['officePhone', 'cellPhone','email','twitterId']},
            {legend:'Profile', fields:['picture','blogUrl', 'manager','reports']}
        ]
    }
});

//EmployeeSchema.pre('save', function (next) {
//    if (this.manager == '' )
//        delete this.manager;
//    next();
//});
//This will be exposed as /api/employees/search/Stuff
EmployeeSchema.statics.search = function(q, term) {
    var regex = {$regex:new RegExp(term || q.term, 'i')}
    return this.find({}).or([
        {firstName:regex},
        {lastName:regex},
        {twitterId:regex},
        {description:regex}
    ]);

}
var Employee = mongoose.model('employee', EmployeeSchema);

module.exports = Employee;