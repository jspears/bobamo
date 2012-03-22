// Filename: app.js
define([
    'jquery',
    'underscore',
    'Backbone',
    'router',
    'views/header'
], function ($, _, Backbone, Router, HeaderView) {
    return {
        initialize:function () {
            this.headerView = new HeaderView();
            $('.header').html(this.headerView.render().el);

            // Close the search dropdown on click anywhere in the UI
            $('body').click(function () {
                $('.dropdown').removeClass("open");
            });
            Router.initialize();
        }

    };
});
