define(['Backbone', 'jquery', 'underscore', 'text!tpl/contact.html'], function (Backbone, $, _, contactTmpl) {

    var ContactView = Backbone.View.extend({
        el:'#content',
        initialize:function () {
            console.log('Initializing Contact View');
            this.template = _.template(contactTmpl);
        },

        render:function (eventName) {
            $(this.el).html(this.template());
            return this;
        }

    });
    return ContactView;
});
