define(['Backbone', 'jquery', 'underscore','text!tpl/header.html', 'libs/bootstrap/js/bootstrap-dropdown'], function (Backbone, $, _,  headerTmpl) {

    var HeaderView = Backbone.View.extend({

        initialize:function () {
            this.template = _.template(headerTmpl);
        },

        render:function (eventName) {
            var $el = $(this.el);
            $el.html(this.template());
            return this;
        },

        active:function (e) {
            var $p = $(e.target).parent();
            $p.parent().children().removeClass('active');
            $p.addClass('active')
        }
    });
    return HeaderView;
});