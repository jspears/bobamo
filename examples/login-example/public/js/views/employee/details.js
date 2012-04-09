define(['Backbone', 'jquery', 'underscore', 'collections/employee', 'views/employee/list', 'text!tpl/employee-details.html', 'text!tpl/employee-full.html'], function (Backbone, $, _, collection, EmployeeListView, detailsTmpl, fullTmpl) {
    var EmployeeFullView = Backbone.View.extend({

        tagName:"div", // Not required since 'div' is the default if no el or tagName specified

        initialize:function () {
            this.template = _.template(fullTmpl);
        },
        show:      function (model) {
            this.model = new collection.Employee(model);
            var self = this;
            this.model.fetch({
                success:function (data) {
                    console
                    $('#content').html(self.render().el);
                }
            });
            this.model.reports.fetch({
                success:function (data) {
                    console.log('reports', data);
                    if (data.length == 0)
                        $('.no-reports').show();
                }
            });
        },
        render:    function (model) {
            $(this.el).html(this.template(this.model.toJSON()));
            $('#details', this.el).html(new EmployeeView({model:this.model}).render().el);

            $('#reports', this.el).append(new EmployeeListView({model:this.model.reports}).render().el);
            return this;
        }

    });

    var EmployeeView = Backbone.View.extend({

        tagName:"div", // Not required since 'div' is the default if no el or tagName specified

        initialize:function () {
            this.template = _.template(detailsTmpl);
            this.model.bind("change", this.render, this);
        },

        render:function (eventName) {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }

    });
    return EmployeeFullView;
});
