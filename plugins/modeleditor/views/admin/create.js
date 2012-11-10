define([
    'jquery',
    'underscore',
    'Backbone',
    'text!${pluginUrl}/templates/admin/create.html',
    'libs/jsonform/jsonform'
], function ($, _, Backbone, createTemplate) {
    "use strict";
    console.log('create template');
    return Backbone.View.extend({
        tagName:'div',
        classNames:['span11'],
        template:_.template(createTemplate),
        initialize: function(){
            this.render();
        },
        render:function (obj) {
            this.$container = obj && obj.container ? $(obj.container) : $('#content');
            this.$table = $(this.template());
            this.$el.append(this.$table);
            this.$container.empty().append(this.$el);
        }
    });
});
