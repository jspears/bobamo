
module.exports = function (bobamo) {

    var mongoose = bobamo.mongoose, Schema = mongoose.Schema
    var RoleSchema = new Schema({
        name: {type: String},
        read: {type: Boolean},
        edit: {type: Boolean},
        remove: {type: Boolean},
        changeOwnership: {type: Boolean}

    })
    var UserSchema = new Schema({
        username: {type: String, required: true, unique: true, index: true, display: {help: 'This must be a unique name'}},
        first_name: {type: String},
        last_name: {type: String},
        twitter: {type: String, required: true, validate: /^@[a-zA-Z0-9]*$/i },
        email: {type: String},
        password: {type: String, display: {dataType: 'Password'}, get: function () {
            return 'password'
        }},
        groups: [
            { type: Schema.ObjectId, ref: 'group', index: true}
        ],
        meta: {
            stars: Number,
            favorite: {type: Number, display: {title: 'Favorite'}}
        },
        messages        : { type: Schema.Types.Mixed,  required: true, index: true },
        roles: [RoleSchema],
        created_at: {type: Date, display: {display: 'none'}},
        created_by: {type: Schema.ObjectId, ref: 'user'},
        modified_at: {type: Date}
//        ,
//        images: [ImageInfo], profile: {type: Schema.ObjectId, ref: 'ProfileImage' }, pictures: [
//            {type: Schema.ObjectId, ref: 'PictureImage'}
//        ]
    }, {safe: true, strict: true, display: {
        fields: ['username', 'first_name', 'last_name', 'password', 'twitter', 'email', 'groups', 'meta.favorite'
        ],
        list_fields: ['username', 'first_name', 'last_name', 'twitter', 'email', 'meta.favorite']
    }});
//    mongoose.model('ProfileImage', ImageInfo);
//    mongoose.model('PictureImage', ImageInfo);

    UserSchema.statics.findA_thru_H = function onFindAH() {
        return this.find().regex('username', /^[a-h]/i);
    }

    UserSchema.statics.findI_thru_P = function onFindIP() {
        return this.find().regex('username', /^[i-p]/i);
    }
    UserSchema.statics.findQ_thru_Z = function onFindQZ() {
        return this.find().regex('username', /^[q-z]/i);
    }
    UserSchema.statics.findI_thru_P.display = {
        title: 'Find I thru P'
    }
    UserSchema.statics.search = function (q, v) {
        console.log('searching for', q.search);
        return this.find().regex('username', new RegExp(".*" + q.search + '.*', 'i'));
    }
    UserSchema.statics.search.display = {
        title: 'Search',
        schema: {
            search: {
                type: 'Text',
                help: 'Search users by username'
            }
        },
        method: 'POST', list_fields: ['username', 'twitter']
    }
    function sha1b64(password) {
        return require('crypto').createHash('sha1').update(password).digest('base64');
    }

    UserSchema.pre('save', function (next) {


        if (this.isNew)
            this.created_at = Date.now();
        else
            this.modfied_at = Date.now();
        next();
    });
    UserSchema.statics.findByUsernamePassword = function (username, password) {
        return  this.where({username: username, _password: sha1b64(password)});
    }

    UserSchema.statics.findByUsernamePassword.display = { hidden: true }
    var User = mongoose.model("user", UserSchema);
}
