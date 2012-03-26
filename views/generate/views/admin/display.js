define(['underscore', 'Backbone',  'text!tpl/admin/less-variables.html'], function (_, Backbone, lessTemplate) {

    return Backbone.View.extend({

        template:_.template(lessTemplate),
        render:function(obj){
            this.$container = obj && obj.container ? $(obj.container) : $('#content');

            this.$el.html(this.template());
            this.$container.empty().append(this.$el);
        }
    })
});