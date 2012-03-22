var crypto = require('crypto'), mongoose = require('mongoose'), Schema = mongoose.Schema;
var UserSchema = new Schema({
    username:{type:String, required:true, unique:true, index:true, display:{help:'This must be a unique name'}},
    first_name:{type:String},
    last_name:{type:String}, 
    twitter:{type:String,required:true, validate: /^@[a-zA-Z0-9]*$/i },
    email:{type:String},
    password:{type:String, display:{dataType:'Password'}, get:function(){ return 'password' }},
    groups:[
        { type:Schema.ObjectId, ref:'group', index:true}
    ],
    meta:{
          stars:Number,
      favorite:{type:Number,display:{title:'Favorite'}}
    },

    created_at:{type:Date, display:{display:'none'}},
    created_by:{type:Schema.ObjectId, ref:'user'},
    modified_at:{type:Date}
}, {safe:true, strict:true, display:{
    fields:['username','first_name','last_name','password','twitter','email','groups', 'meta.favorite'],
    list_fields:['username','first_name','last_name','twitter','email']
}});

function sha1b64(password) {
    return crypto.createHash('sha1').update(password).digest('base64');
}
//UserSchema.virtual('password').set(
//    function (password) {
//        this.set('_password', sha1b64(password));
//    }).get(function () {
//        return this.get('_password');
//    });

UserSchema.pre('save', function (next) {

    var _this = this;
    if (this._doc.password && this._doc.password != 'password'){
        this.password = sha1b64(_this._doc.password)
    }
    if (this.isNew)
        this.created_at = Date.now();
    else
        this.modfied_at = Date.now();
    next();
});
UserSchema.statics.findByUsernamePassword = function (username, password) {
    return  this.where({username:username, _password:sha1b64(password)});
}

var User = mongoose.model("user", UserSchema);
module.exports = User;
