define(['underscore', 'Backbone', 'libs/bobamo/edit', 'text!renderer/templates/edit.html'], function (_, B, EditView, template) {
    var jsonModel  ={{json model}};

    var rootUrl = '${pluginUrl}/admin/renderer/${model.modelName}';
    var Model = B.Model.extend({
        idAttribute: '_id',
        url: rootUrl,
        schema: jsonModel.schema,
        parse: function (p) {
            return p.status === 0 ? p.payload : p;
        }
    });

    return EditView.extend({
        model: Model,
        template: _.template(template),
        fieldsets: jsonModel.fieldsets,
        events: _.extend({}, EditView.prototype.events, {
            'click .saveas': 'onSaveAs'
        }),
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
        onFetch:function(){
          this.form.setValue(this.model.toJSON());
        },
        render: function (opts) {
            opts = opts || {};
            var $el = this.$el.html(this.template());
            var id = opts._id = jsonModel.modelName;

            var model = this.model = this.createModel(_.extend(opts));
            model.on('sync', this.onSuccess, this);
            var title = '<i class="icon-edit"></i> Edit {title} [{id}]';
            var config = _.extend({id: id}, this.config);
            var form = this.form = this.createForm({
                model: model,
                fieldsets: this.fieldsets || model.fieldsets || [
                    {legend: replacer(title, config), fields: this.fields}
                ]
            });
            var $fm = $('.form-container', this.$el);
            form.on('render', function () {
                var html = form.el;
                $fm.append(html);
                model.fetch();
            }, this);

            form.render();
            $(this.options.container).html($el);
        }
    });

})
;