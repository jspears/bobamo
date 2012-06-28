define(['Backbone', 'jquery', 'underscore', 'text!passport/tpl/login.html'], function (Backbone, $, _, loginTmpl) {

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
                this.onSuccess(res);
            } else {
                this.onFail();
            }
        },
        onFail:   function () {
            $(this.el).find('.alert-warning').show('slow');
        },
        onSuccess:function (res) {
            window.isAuthenticated = res;
            $(this.el).find('.alert-warning').hide('slow', this.onNext);
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
