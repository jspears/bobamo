var mongoose = require('mongoose'), User = require('../app/model/user'), assert = require('assert'), should =require('should');
before(function () {
    mongoose.connect('mongodb://localhost/mojaba_development')
})

describe('Testing User Schema', function () {
    it('should save a user', function (done) {
        /*username:{type:String, required:true, unique:true, index:true},
         first_name:{type:String},
         last_name:{type:String},
         email:{type:String},
         _password:{type:String},
         groups:[
         { type:Schema.ObjectId, ref:'group', index:true}
         ],
         created_at:{type:Date},
         created_by:{type:Schema.ObjectId, ref:'user'},
         modified_at:{type:Date}*/
        new User({
            username:  'jspears',
            password:  'jspears',
            first_name:'Justin',
            last_name: 'Spears',
            email:     'speajus@gmail.com'
        }).save(function (err, obj) {
            assert.ifError(err);
            obj.should.have.property('_id');

            done();
        })
    });
});