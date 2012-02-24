define(['Backbone', 'jquery', 'Underscore', 'text!tpl/employee-list-item.html'], function (Backbone, $, _, employeeListItem) {
    var EmployeeListView = Backbone.View.extend({

        tagName:'ul',

        className:'nav nav-list',

        initialize:function () {
            var self = this;
            this.model.bind("reset", this.render, this);
            this.model.bind("add", function (employee) {
                $(self.el).append(new EmployeeListItemView({model:employee}).render().el);
            });
        },

        render:function (eventName) {
            $(this.el).empty();
            _.each(this.model.models, function (employee) {
                $(this.el).append(new EmployeeListItemView({model:employee}).render().el);
            }, this);
            return this;
        }
    });
    var EmployeeListItemView = Backbone.View.extend({

        tagName:"li",

        initialize:function () {
            this.template = _.template(employeeListItem);
            this.model.bind("change", this.render, this);
            this.model.bind("destroy", this.close, this);
        },

        render:function (eventName) {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }

    });
    return EmployeeListView;
});