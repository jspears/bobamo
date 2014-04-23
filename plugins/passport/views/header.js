define(['super/views/header', 'underscore', 'passport/views/login-state', 'text!/passport/views/tpl/header.html'], function(HeaderView, _, LoginState, headerTmpl){



   return HeaderView.extend({
        template:_.template(headerTmpl),
        initialize:function(){
            HeaderView.prototype.initialize.apply(this, _.toArray(arguments));
            LoginState.on('login', _.bind(this.fetch, this));

            LoginState.on('logout', _.bind(this.fetch, this));
            return this;

        }
    })

})