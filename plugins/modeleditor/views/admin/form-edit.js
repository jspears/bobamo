define(['Backbone', 'Backbone.Form/form-model',
    'libs/bobamo/edit',
    'libs/util/inflection',
    'libs/renderer/renderers',
    'libs/jquery/jqtpl',
    'backbone-modal',
    'text!modeleditor/views/templates/admin/form-edit.html',
    'libs/jquery/jquery.busy', //added to $
    'libs/editors/reorder-list-editor', //added to Form.editors
    'libs/editors/dyna-nested-model-editor',
    'libs/editors/typeahead-editor'

], function (B, Form, EditView, inflection, Renderer, jqtpl, modal, template) {
    "use strict";
    var pslice = Array.prototype.slice;
    Form.editors.Blank = Form.editors.Text.extend({
        tagName: 'div',
        setValue: function (val) {
            this.value = val;
        },
        getValue: function () {
            return this.value;
        }

    })
    var NestedModel = Form.editors.NestedModel;
    var undef = function(v){
        return v !== void(0);
    }
    var schema = {
        isWizzard: {
            type: 'Checkbox',
            help: 'Do you want a wizard?'
        },
        fieldsets: {
            title: 'Fieldsets',
            type: 'ReorderList',
            itemType: 'NestedModel',
            model: B.Model.extend({
                toString: function () {
                    var fields = this.get('fields') || [];
                    return  '<div><h3>' + this.get('legend') + '</h3>' +
                        '<em>fields: </em><small>' + (fields.map(function (v) {
                        return v.property
                    }).join(', '));
                    +'</small></div>'
                },
                schema: {
                    legend: {type: 'Text'},
                    fields: {
                        type: 'ReorderList',
                        itemType: 'NestedModel',
                        listItemTemplate: 'listItemReorder',
                        idAttribute: 'property',
                        model: B.Model.extend({
                            toString: function () {
                                return this.get('property');
                            },
                            renderConfig: function () {
                                var val = this.form.getValue();
                                var editor = val.type || this.get('type') || 'Blank';
                                var form = this.form;

                                function onRenderEditor(editorConf) {
                                    var schema = editorConf && editorConf.payload && editorConf.payload.schema
                                    var fields = form.fields, config = fields.config;
                                    var $el = config.editor.$el;
                                    config.editor.remove();
                                    var data = form.getValue().config;
                                    var configModel = new Form.editors.Object({schema: {subSchema: schema}, value: data, key: config.key, idPrefix: editor}).render();
                                    $el.replaceWith(configModel.el);
                                    config.editor = configModel;

                                }

                                if (editor !== 'Blank')
                                    require(['json-data!modeleditor/admin/editor/' + editor], onRenderEditor);
                                else
                                    onRenderEditor({payload: {schema: {
                                        config: {
                                            schemaType: 'Blank',
                                            type: 'Blank',
                                            help: '<div>No Configuration for "' + editor + '"</div>'
                                        }
                                    }}});
                            },

                            createForm: function (opts) {

                                var form = this.form = new Form(opts);
                                form.on('render', this.renderConfig, this);
                                form.on('type:change', this.renderConfig, this);
                                return form;
                            },
                            schema: {
                                title: {
                                    type: 'Text'
                                },
                                property: {
                                    type: 'Typeahead',
                                    url: '${pluginUrl}/admin/properties/?',
                                    validators: [
                                        {type: 'required'}
                                    ]
                                },

                                config: {
                                    type: 'Blank',
                                    fieldClass: 'form-vertical'
                                },
                                type: {
                                    type: 'Select',
                                    url: '${pluginUrl}/admin/editors'
                                }
                            }
                        })
                    }
                }
            }),
            listItemTemplate: 'listItemReorder'
        }
    };

    function swapItems(list, a, b) {
        list[a] = list.splice(b, 1, list[a])[0];
        return list;
    }

    function currentProperty($e) {
        var $parent = $e.parents('.control-group');
        return $parent.length ? $parent[0].className.replace(/.*field-([^\s]*).*/, "$1") : null;
    }

    function currentAction($e) {
        return $e.length ? $e[0].className.replace(/.*toolbar-([^\s]*).*/, "$1") : null;
    }

    var ToolBarView = B.View.extend({
        events: {
            'click .btn': 'onAction'
        },
        className: 'btn-toolbar toolbar',
        onAction: function (e) {
            if (e) e.preventDefault();
            var $e = $(e.currentTarget);
            this.trigger(currentAction($e) + '-property', currentProperty($e));
        },

        render: function onToolbarRender() {

            this.$el.html('<div class="btn-group"><button class="btn btn-mini toolbar-edit"><i class="icon-edit"/></button><button class="btn btn-mini toolbar-remove"><i class="icon-remove"/></button><button class="btn btn-mini toolbar-up"><i class="icon-arrow-up"/></button><button class="btn btn-mini toolbar-down"><i class="icon-arrow-down"/></button></div>');
            return this;
        }
    })

    return EditView.extend({
        upProperty: function (property) {
            if (this.findField(property, function (vv, idx, v) {
                swapItems(v.fields, idx - 1, idx );
            })) {
                this.onPreview();

            }
        },
        downProperty: function (property) {
            if (this.findField(property, function (vv, idx, v) {
                swapItems(v.fields, idx + 1, idx);
            })) {
                this.onPreview();
            }
        },
        editProperty: function (property) {
            var refFields =this.form.fields.fieldsets.editor.schema.model.prototype.schema.fields

            var data, didx, fields;
            this.findField(property, function(vv,idx,v){
                data = vv;
                didx = idx;
                fields = v.fields;
            })
            var modelInstance = new refFields.model(data);
            var opts = {model:modelInstance};
            var form =  modelInstance.createForm(opts);

            var modal = this.modal = new Form.editors.List.Modal.ModalAdapter({
                content: form,
                animate: true
            });
            modal.open();
            modal.on('ok', function onEdit(){
                fields[didx] = form.getValue();
                this.onPreview();
            }, this);
        },
        removeProperty: function (property) {
            if (this.findField(property, function (vv, kk, v) {
                v.fields.splice(kk, 1);
            })) {
                this.onPreview();
            }
        },
        findField: function (property, callback) {
            var ret = false
            _.each(this.modelInstance.get('fieldsets'), function (v, k) {
                _.each(v.fields, function (vv, kk) {
                    if (vv && vv.property === property) {
                        callback(vv, kk, v);
                        return !(ret = true);
                    }
                });
                return !ret;
            });
            return ret;
        },
        events: {
            'mouseenter .preview-container .control-group': 'hoverIn',
            'mouseleave .preview-container .control-group': 'hoverOut'

        },
        hoverIn: function (e) {
            if (!this.toolbar) {
                this.toolbar = new ToolBarView().render();
                this.toolbar.on('edit-property', this.editProperty, this);
                this.toolbar.on('remove-property', this.removeProperty, this);
                this.toolbar.on('up-property', this.upProperty, this);
                this.toolbar.on('down-property', this.downProperty, this);
            }
            $(e.currentTarget).prepend(this.toolbar.$el);
        },
        hoverOut: function (e) {
            if (this.toolbar)
                this.toolbar.$el.detach();
        },
        model: B.Model.extend({
            schema: schema,
            urlRoot: '${pluginUrl}/admin/model',
            parse: function (resp) {
                resp = resp.payload;
                var schema = resp.schema;
                if (!resp.fieldsets) return;
                this._schema = schema;
                resp.fieldsets = resp.fieldsets.map(function (v) {
                    v.fields = v.fields.map(function (field) {

                        if (_.isString(field)) {
                            var f = schema[field] || {}
                            if (f) f.property = field;
                            return f || {
                                property: field,
                                title: field,
                                type: 'Text'
                            }
                        } else {
                            if (field && !field.property)
                                field.property = field.name;
                            return field;
                        }

                    });

                    return v;
                });

                return _.pick(resp, 'fieldsets', 'isWizard');
            }
        }),
        onPreview: function (e) {
            if (e && e.preventDefault)
                e.preventDefault();
            this.$preview = this.$el.find('.preview-container');
            this.$preview.busy({
                img: 'img/ajax-loader.gif',
                title: 'Previewing...'
            });
            var id = this.modelInstance.id;
            require(['views/' + id + '/edit',
                'text!templates/' + id + '/edit.html.raw'
            ], this.doPreview.bind(this));

        },
        doPreview: function (View, template) {
            if (this.toolbar) {
                this.toolbar.remove();
                delete this.toolbar;
            }
            if (this.preView)
                this.preView.remove();
            var config = this.createConfig(template);
            var NView = View.extend(config);
            this.$preview.empty();
            var v = this.preView = new NView();
            v.render();

            this.$preview.busy('remove');
            this.$preview.html(v.$el);
        },
        onSuccess: function () {
            EditView.prototype.onSuccess.apply(this, pslice.call(arguments))
            var id = this.modelInstance.id;
            require(['views/' + id + '/edit',
                'text!templates/' + id + '/edit.html.raw'
            ], this.doModify.bind(this));
        },
        doModify: function (View, table, tableItem) {
            _.extend(View.prototype, this.createConfig(table, tableItem));
        },
        createConfig: function (formtemplate) {
            var fieldsets = this.form.getValue().fieldsets;
            var schema = {};
            var fieldset = []
            fieldsets.forEach(function (fset) {
                fieldset.push({
                    legend: fset.legend,
                    fields: fset.fields.filter(undef).map(function (v) {
                        schema[v.property] = v;
                        return v.property;
                    })
                })
            });
            var obj = {
                model: {
                    pathFor: function (property) {
                        for (var i = 0, l = list.length; i < l; i++) {
                            var itm = list[i];
                            if (itm && itm.property == property)
                                return itm;
                        }
                        return {title: property}

                    }
                }
            };
            return {
                template: _.template(jqtpl.render(formtemplate, obj)),
                fieldsets: fieldset,
                schema: schema
            }
        },
        prepare: function () {
            var data = this.form.getValue();
            return data;
        },
        render: function (obj) {
            EditView.prototype.render.call(this, obj);
            this.form.on('change', this.onPreview, this);
            this.form.on('render', this.onPreview, this);
            return this;
        },
        listUrl: function () {
            return "#${pluginUrl}/views/admin/list"
        },
        createModel: function (opts) {
            var model = new this.model(opts);
            model.schema.fieldsets.model.prototype.schema.fields.model.prototype.schema.property.url = '${pluginUrl}/admin/properties/' + opts.id + '?'


            return model;

        },
        createTemplate: _.template('<i class="icon-plus"></i>Create New <%=title%>'),
        editTemplate: _.template('<i class="icon-edit"></i> Edit <%=title%>'),
        fields: ['isWizzard', 'fieldsets'],
        template: _.template(template),
        config: {
            title: 'Form View'
        }
    });
});