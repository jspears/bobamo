define([
    'jquery',
    'underscore',
    'Backbone',
    'router',
    'setup/setupwizard'
], function ($, _, Backbone, Router,Setup) {
    return (function () {

        new Setup({
            el:$('#content')
        }).render();

        return this;

    })();
});