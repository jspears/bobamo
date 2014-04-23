define(['underscore', 'Backbone', 'Backbone.Form', 'libs/bobamo/edit', 'backbone-modal', 'text!csvimport/templates/import.html' ], function (_, B, Form, EditView, Modal, template) {
    return B.View.extend({
        el: "#content",
        template: _.template(template),
        events: {
            'click .save': 'onSave',
            'click .configure': 'onConfigure',
            'click .edit-configure': 'onConfigure',
            'click .remove-configure': 'onRemoveConfigure'
        },
        onRemoveConfigure: function (e) {
            if (e && e.preventDefault) e.preventDefault();
            var value = this.form.getValue();
            var self = this;
            if (confirm("Are you sure you want to delete '" + value.configuration + '"?')) {
                //noinspection JSUnusedLocalSymbols
                require(['csvimport/configure-model'], function (ConfModel) {
                    var conf = new ConfModel(value);
                    conf.on('destroy', self.onModelNameChange, self);
                    conf.destroy();
                });
            }

        },
        onConfigure: function (e) {
            if (e && e.preventDefault) e.preventDefault();
            if (e instanceof B.Model)
                var model = e;
            var value = this.form.getValue();
            var self = this;
            //noinspection JSUnusedLocalSymbols
            require(['csvimport/configure', 'csvimport/configure-model'], function onRequireConfigureModel(ConfView, ConfModel) {
                var model = new ConfModel(value);

                var c = new ConfView({model: model});
                c.on('render', function () {
                    var modal = self.modal = new Modal({
                        title: 'Configure CSV Import for ' + value.modelName,
                        content: c.el
                    });
                    modal.$el.addClass('wide-modal');
                    modal.open(function (e) {
                        console.log('saving ', e);
                        c.save();
                    });

                });
                c.on('save-success', function(){
                    self._configure = c.form.getValue().configuration;
                    self.onModelNameChange()
                }, self);
                c.render();
            });
        },
        onSave: function (e) {
            if(e && e.preventDefault)
                e.preventDefault();
            var $fel = this.form.$el;
            $fel.iframePostForm({
                complete: _.bind(this._save, this),
                json: true
            });
            $fel.attr('enctype', 'multipart/form-data');
            $fel.attr('method', 'POST');
            $fel.attr('action', "${pluginUrl}/admin/import");
            $fel.submit();
        },
        _save: function (resp) {
            this.form.fields.import.$el.val('');
            console.log('resp', resp);
            var $sl = this.$el.find('.success-list'),
                $el = this.$el.find('.error-list');
            if (resp.payload) {
                $sl.html("<li>Imported <i>" + resp.payload.length + "</i> rows into <i>" + this.form.getValue().modelName + "</i></li>").show();
            } else {
                $sl.hide();
            }
            if (resp.errors) {
                $el.append.apply($el, _.map(resp.errors, function (e) {
                    return '<li> error importing <code>' + e + '</code></li>'
                }));
                $el.show();
            } else {
                $el.hide();
            }

        },
        render: function () {
            this.$el.html(this.template);
            var form = this.form = new Form({
                schema: {
                    import: {
                        type: 'File',
                        help: 'CSV File to import'
                    },
                    empty: {
                        type: 'Checkbox',
                        help: 'Do you want to erase all previous data in the object before import'
                    },
                    skip: {
                        type: 'Integer',
                        help: 'How many rows do you want to skip'
                    },
                    modelName: {
                        type: 'Select',
                        help: 'Which model would you like to import this to',
                        collection: 'views/modeleditor/admin/schema-collection'
                    },
                    configuration: {
                        type: 'Select',
                        options: [],
                        help: 'Create a ' +
                            '<a href="#" class="configure"><i class="icon-plus"></i>New Configuration</a>' +
                            '<span style="display:none" class="edit-configure-remove"> or ' +
                            '   <a href="#" class="edit-configure"><i class="icon-edit"></i>Edit</a>' +
                            ' / ' +
                            '   <a href="#" class="remove-configure"><i class="icon-trash"></i>Delete</a>' +
                            '</span>'
                    }
                },
                data: {
                    skip: 1
                },
                fieldsets: [
                    {
                        legend: 'CSV Import',
                        fields: ['import', 'modelName', 'empty', 'skip', 'configuration']
                    }
                ]
            });
            this.form.on('render', function () {
                this.$el.find('.form-container').html(this.form.$el);
            }, this);
            var first = true;
            this.form.on('modelName:options', function (evt, options) {
                console.log('on options', options);
                if (first) {
                    this.onModelNameChange()
                }
                first = false;
            }, this);
            this.form.on('configuration:options', function (evt, options) {
                this.$el.find('.edit-configure-remove')[(options.length && options[0].val) ? 'show' : 'hide']();

            }, this);
            this.form.on('modelName:change', this.onModelNameChange, this);
            this.form.render();


            return this;
        },
        onModelNameChange: function () {
            var form = this.form;
            var value = form.getValue();
            var conf = this._configure;
            if (value)
                $.ajax({
                    method: 'GET',
                    url: "${pluginUrl}/admin/importmodel/label/" + value.modelName,
                    success: function (resp) {
                        form.fields.configuration.editor.setOptions(resp.payload);
                        if (conf)
                            form.fields.configuration.editor.setValue(conf);
                    }
                })
        }


    })
});