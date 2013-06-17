define(['Backbone', 'Backbone.Form/form-model',
    'libs/bobamo/edit',
    'libs/bobamo/toolbar',
    'libs/util/inflection',
    'libs/renderer/renderers',
    'libs/jquery/jqtpl',
    'backbone-modal',
    'text!modeleditor/views/templates/admin/form-edit.html',
    'libs/jquery/jquery.busy', //added to $
    'libs/editors/reorder-list-editor', //added to Form.editors
    'libs/editors/dyna-nested-model-editor',
    'libs/editors/typeahead-editor'

], function (B, Form, EditView, ToolbarView, inflection, Renderer, jqtpl, modal, template) {
    "use strict";
    var pslice = Array.prototype.slice, NestedModel = Form.editors.NestedModel;
    Form.editors.Blank = Form.editors.Text.extend({
        tagName: 'div',
        setValue: function (val) {
            this.value = val;
        },
        getValue: function () {
            return this.value;
        }

    });
    function swapItems(list, a, b) {
        var aitm = list[a];
        var bitm = list[b];
        list[b] = aitm, list[a] = bitm;
        return list;
    }

    function findObj(obj, property) {
        var p = property.split('.');
        while (p.length && obj) {
            obj = obj[p.shift()];
            if (p.length && obj.subSchema)
                obj = obj.subSchema;
        }
        return p.length ? null : obj;
    }

    function undef(v) {
        return v !== void(0);
    }

    var EditProperty = B.Model.extend({
        toString: function () {
            return this.get('property');
        },
        renderConfig: function () {
            var val = this;
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
            opts = opts || {};
            if (!opts.model) opts.model = this;
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
//                type: 'Text',
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
    });
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
                        model: EditProperty
                    }
                }
            }),
            listItemTemplate: 'listItemReorder'
        }
    };


    return EditView.extend({
        upProperty: function (property) {
            if (this.findField(property, function (vv, idx, v) {
                swapItems(v.fields, idx - 1, idx);
            })) {
                this.onPreview();

            }
        },
        downProperty: function (property) {
            if (this.findField(property, function (vv, idx, v) {
                swapItems(v.fields, idx, idx + 1);
            })) {
                this.onPreview();
            }
        },
        editProperty: function (property) {
            var data = {}, didx, fields;
            this.findField(property, function (vv, idx, v) {
                data = vv;
                didx = idx;
                fields = v.fields;
            })
            if (data && !data.conf) data.config = data;
            var form = new EditProperty(data).createForm();
            this.openModal(form, function onEdit() {
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
        addProperty: function () {
            var modelInstance = new EditProperty({type: 'Text'});
            var form = modelInstance.createForm();
            this.openModal(form, function onAddProperty() {
                var fields = (this.modelInstance.get('fieldsets')[0].fields);
                var val = form.getValue();
                var m = _.extend(_.omit(val, 'config'), val.config);
                fields.push(m);
                this.onPreview();
            });
        },
        openModal: function (content, okCallback) {
            var modal = this.modal = new Form.editors.List.Modal.ModalAdapter({
                content: content,
                animate: true
            });
            modal.open();
            modal.on('ok', okCallback, this);
        },
        findField: function (property, callback) {
            var ret = false
            _.each(this.modelInstance.get('fieldsets'), function (v, k) {
                _.each(v.fields, function (vv, kk) {
                    if (vv && vv.property === property) {
                        if (!ret)
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
                this.toolbar = new ToolbarView().render();
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
            urlRoot: '${pluginUrl}/admin/model/fieldsets',
            parse: function (resp) {
                resp = resp.payload || resp;
                var schema = resp.schema;


                this._schema = schema;
                var fields = [];
                var fieldsets = [
                    {fields: fields}
                ];
                if (resp.fieldsets)
                    resp.fieldsets = resp.fieldsets.map(function (v) {
                    if (v.fields) {
                        v.fields = v.fields.map(function (field) {

                            if (_.isString(field)) {
                                var f = findObj(schema, field) || {}
                                f.property = field;
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
                    } else {
                        fields.push(_.extend({property: v}, findObj(schema, v)));
                    }

                });
                var title = resp.title || resp.id;
                if (fields.length)
                    resp = {fieldsets: fieldsets};

                if (resp.fieldsets.length == 1 && !resp.fieldsets[0].legend)
                    resp.fieldsets[0].legend=title;

                return _.pick(resp, 'fieldsets', 'isWizard','plural','title','modelName');
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
                this.toolbar = null;
                delete this.toolbar;

            }
            if (this.preView) {
                this.preView.remove();
                delete this.preView;
            }
            var config = this.createConfig(template);
            var NView = View.extend(config);
            var NModel = NView.prototype.model;
            //The view will have property, so set it here...
            NView.prototype.model = config.model = NModel.extend({schema: config.schema});
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
            var fieldsets = this.modelInstance.get('fieldsets'),
                title = this.modelInstance.get('title'),
                plural = this.modelInstance.get('plural');
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
                schema: schema,
                config:{
                    title:title || this.modelInstance.id,
                    plural:plural
                }
            }
        },
        prepare: function () {
            var data = this.form.getValue();
            return data;
        },
        render: function (obj) {
            EditView.prototype.render.call(this, obj);
            this.previewTB = new ToolbarView({
                className: 'preview-toolbar',
                buttons: {
                    'add': {iconCls: 'icon-plus-sign', title: 'Add Form Field...'},
                    'fieldset': {iconCls: 'icon-wrench'}
                }
            }).render();
            this.$el.find('.preview').append(this.previewTB.$el);
            this.previewTB.on('add-property', this.addProperty, this);
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