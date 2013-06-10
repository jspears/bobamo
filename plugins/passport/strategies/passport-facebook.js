var bobamo = require('../../index'), mongoose = bobamo.mongoose;
module.exports = {
    schema: {
        clientID: {
            type: 'Text',
            help: 'enter your FACEBOOK_APP_ID',
            validators: [
                {type: 'required'}
            ]
        },
        clientSecret: {
            type: 'Text',
            help: 'enter your FACEBOOK_APP_SECRET',
            validators: [
                {type: 'required'}
            ]
        },
        callbackDomain: {
            type: 'Text',
            placeholder: "http://www.example.com/",
            help: 'The domain to redirect traffic to',
            validators: [
                {type: 'required'}
            ]
        },
        facebookUserIDField:{
            type: 'Text',
            help:'The facebok userID field on the authModel'
        },
        authModel: {
            type: 'Select',
            single: true,
            validators: [
                {type: 'required'}
            ],
            collection: 'views/modeleditor/admin/schema-collection',
            help: 'Which Schema to use as the user model'
        }
    },
    configure: function (conf) {
        this.conf = conf;


    },
    register: function (FacebookStrategy, passport, plugin) {
        var conf = this.conf
        passport.use(new FacebookStrategy({
                clientID: this.conf.clientID,
                clientSecret: this.conf.clientSecret,
                callbackURL: this.conf.callbackDomain + "/auth/facebook/callback"
            },
            function (accessToken, refreshToken, profile, done) {
                var field = conf['facebookUserIDField'] || 'fbUserID';
                var obj = {};
                obj[field] = profile.userID;
                var m = mongoose.model(this.conf.authModel);
                m.findOne(obj, function (e, o) {
                    if (!o)
                        (m.createFacebookProfile || m.save)(profile, function (err, user) {
                            if (err) return done(err);
                            done(null, user);
                        });
                })
            }
        ));
        plugin.app.get('/auth/facebook', passport.authenticate('facebook'));

        // Facebook will redirect the user to this URL after approval.  Finish the
        // authentication process by attempting to obtain an access token.  If
        // access was granted, the user will be logged in.  Otherwise,
        // authentication has failed.
        plugin.app.get('/auth/facebook/callback',
            passport.authenticate('facebook', { successRedirect: '/',
                failureRedirect: '/login' }));
    }
}