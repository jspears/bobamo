define(['Backbone', 'jquery', 'underscore', 'passport/views/login-state', 'text!passport/views/tpl/login.html'], function (Backbone, $, _, loginState, loginTmpl) {

    var LoginView = Backbone.View.extend({
        el:        '#content',
        initialize:function () {
            this.template = _.template(loginTmpl);
            _.bindAll(this, 'onLogin', 'onNext');
        },

        render:function (event) {

            this.origEvent = event;
            $(this.el).html(this.template());
            return this;
        },

        events:{
            "submit form":"login"
        },

        login:    function (event) {
            event.preventDefault();
            loginState.fetch()
            $.ajax({
                url:'passport',
                type:'POST',
                data:$(this.el).find('form').serialize(),
                success:_.bind(this.onLogin, this)
            });
        },
        onLogin:  function (res) {
            console.log('onLogin', arguments);
            if (res.status === 0) {
                this.onSuccess(res.payload);
            } else {
                this.onFail();
            }
        },
        onFail:   function () {
            $(this.el).find('.alert-error').show('slow');
        },
        onSuccess:function (res) {
            loginState.isAuthenticated  = window.isAuthenticated = true;
            loginState.set(res);
            loginState.trigger('loggedin');
            $(this.el).find('.alert-error').hide('slow', this.onNext);
        },
        onNext:   function () {
            if (this.options && this.options.router){
                console.log('navigating to ', this.origEvent || '/#home');
                this.options.router.navigate(this.origEvent || '/#home', {trigger:true, replace:true});
            }
        }

    });
    return LoginView;
});
