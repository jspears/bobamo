define(['Backbone', 'jquery', 'underscore', 'text!tpl/home.html'], function (Backbone, $, _, homeTmpl) {

    var HomeView = Backbone.View.extend({
        el:'#content',
        initialize:function () {
            console.log('Initializing Home View');
            this.template = _.template(homeTmpl);
        },

        events:{
            "click #showMeBtn":"showMeBtnClick"
            },

        render:function (eventName) {
            $(this.el).html(this.template());
            return this;
        },

        showMeBtnClick:function () {
            app.headerView.search();
        }

    });
    return HomeView;
});
