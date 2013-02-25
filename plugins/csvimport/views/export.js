define(['underscore', 'Backbone', 'Backbone.Form', 'text!csvimport/templates/export.html'], function (_, B, Form, template) {
    var ExportModel = B.Model.extend({
        url:"${pluginUrl}/export"
    });
    var ImportView = B.View.extend({
        el:"#content",
        template:_.template(template),
        events:{
            'click .export':'onExport'
        },
        onExport:function(){
            this.form.$el.attr("action", "${pluginUrl}/export");
            this.form.$el.attr("method", "POST");
            this.form.$el.attr("target", "_blank");
            this.form.$el.submit();
        },
        render:function () {
            this.$el.html(this.template);
            this.form = new Form({
                model:new ExportModel,
                schema:{
                    modelName:{
                        type:'Select',
                        help:'Which model would you like to export this to',
                        collection:'views/modeleditor/admin/schema-collection'
                    },
                    fileName:{
                        type:'Text',
                        help:'What would you like the exported file to be named'
                    }
                },
                fieldsets:[
                    {
                        legend:'Export CSV',
                        fields:['modelName',  'fileName']
                    }
                ]
            });
            this.form.on('render', function () {
                this.$el.find('.form-container').html(this.form.$el);
            }, this);

            this.form.render();


            return this;
        }

    })
    return ImportView;
});