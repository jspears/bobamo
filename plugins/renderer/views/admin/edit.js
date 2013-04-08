define(['underscore', 'Backbone', 'libs/bobamo/edit', 'text!renderer/templates/edit.html'], function (_, B, EditView, template) {
    var jsonModel //${nl()} ={{json model}};

    var rootUrl = '${pluginUrl}/admin/renderer/${model.modelName}';
    var Model = B.Model.extend({
        idAttribute: '_id',
        url: rootUrl,
        schema: jsonModel.schema || {
            type:'ReadOnly',
            template:'No configuration options for {{model.id}}'
        },
        fields:jsonModel.fields,
        defaults:jsonModel.defaults || {},
        parse: function (p) {
            return p.status === 0 ? p.payload : p;
        }
    });
    console.log('jsonModel.schema [${model.modelName}]', jsonModel.schema);

    return EditView.extend({
        model: Model,
        template: _.template(template),
        fieldsets: jsonModel.fieldsets,
//        events: _.extend({}, EditView.prototype.events, {
//            'click .saveas': 'onSaveAs'
//        }),
        buttons: {
            left: [
                {html: 'Cancel', type: 'a', href: "#views/renderer/admin/list" }
            ],
            right: [
                {
                    html: 'Save As...',
                    clsNames:'saveas',
                    events: {
                        'click .saveas': 'onSaveAs'
                    }
                },
                {
                    html:'Save',
                    clsNames:'save  btn-primary'
                }
            ]
        },
        prepare: function () {
            return {
                defaults: this.form.getValue()

            }
        },
        onSaveAs: function () {
            var name = prompt('What would you like to save this as?');
            if (name && (name = name.replace(/^\s|\s$/g, ''))) {
                this.form.model.url = rootUrl + '/' + name;
                this.save();
            }
        },
        onFetch: function () {
            this.form.setValue(this.model.toJSON());
        }
    });

})
;