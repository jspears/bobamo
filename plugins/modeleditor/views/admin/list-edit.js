define(['Backbone', 'Backbone.Form/form-model',
    'libs/bobamo/edit',
    'libs/util/inflection',
    'libs/renderer/renderers',
    'libs/jquery/jqtpl',
    'backbone-modal',
    'text!modeleditor/views/templates/admin/list-edit.html',
    'libs/jquery/jquery.busy', //added to $
    'libs/editors/reorder-list-editor', //added to Form.editors
    'libs/editors/dyna-nested-model-editor',
    'libs/editors/typeahead-editor'

], function (B, Form, EditView, inflection, Renderer, jqtpl, modal, template) {
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
    var RenderCollection = B.Collection.extend({
        url: '${baseUrl}renderer/renderers',
        parse: function (resp) {
            return resp.payload
        },
        model: B.Model.extend({
            idAttribute: '_id',
            toString: function () {
                return this.get('_id');
            }
        })
    });

    var rendererCollection = new RenderCollection;
    rendererCollection.fetch();
    var RenderModel = B.Model.extend({
        url: '${baseUrl}/modeleditor/admin',
        fieldsets: [
            {fields: ['property', 'title', 'renderer', 'config']}
        ],
        toString: function () {
            return  '<div><h3>' + this.get('title') + '</h3>' +
                '<small>' +
                this.get('property')
                + ' renderer: ' + (this.get('renderer') || 'Default');
            +'</small></div>'
        },
        renderConfig: function () {
            var renderer = this.form.getValue().renderer;
            var form = this.form;
            require(['renderer/views/admin/' + renderer + '/edit'], function (View) {
                var fields = form.fields, config = fields.config;
                var Model = View.prototype.model;
                var $el = config.editor.$el;
                console.log('schema', Model.prototype.schema);
                config.editor.remove();
                var data = form.getValue().config;
                if (Model.prototype.schema) {
                    var configModel = new NestedModel({schema: {model: Model}, value: data, key: config.key, idPrefix: renderer}).render();
                    $el.replaceWith(configModel.el);
                    config.editor = configModel;
                } else {
                    config.editor = {
                        remove: function () {
                        },
                        getValue: function () {
                            return null
                        },
                        $el: $el.replaceWith('<div>No Configuration for "' + renderer + '"</div>')
                    }

                }

            });
        },

        createForm: function (opt) {
            var form = this.form = new Form(opt);
            console.log('createForm', this);
            form.on('render', this.renderConfig, this)
            form.on('renderer:change', this.renderConfig, this)
            return form;
        },
        schema: {
            renderer: {
                type: 'Select',
                options: rendererCollection
            },

            config: {
                type: 'Blank',
                title: 'Configure Renderer',
                fieldClass: 'form-vertical'

            },
            title: {
                type: 'Text'
            },
            property: {
                type: 'Typeahead',
                validators: [
                    {type: 'required'}
                ]
            }
        }
    })

    var schema = {
        list: {
            type: 'ReorderList',
            itemType: 'NestedModel',
            model: RenderModel,
            listItemTemplate: 'listItemReorder'
        }
    };
    return EditView.extend({
        model: B.Model.extend({
            schema: schema,
            urlRoot: '${pluginUrl}/admin/list',
            parse: function (resp) {
                return resp.payload;
            }
        }),
        onPreview: function (e) {
            if (e && e.preventDefault)
                e.preventDefault();
            this.$preview = this.$el.find('.preview-content');
            this.$preview.busy({
                img: 'img/ajax-loader.gif',
                title: 'Previewing...'
            });
            var id = this.modelInstance.id;
            require(['views/' + id + '/list',
                'text!templates/' + id + '/table.html.raw',
                'text!templates/' + id + '/table-item.html.raw'

            ], this.doPreview.bind(this));

        },
        doPreview: function (View, table, tableItem) {
            if (this.preView)
                this.preView.remove();
            var config = this.createConfig(table, tableItem);
            var NView = View.extend(config);
            var v = this.preView = new NView();
            v.render({
                container: this.$preview
            });
            this.$preview.busy('remove');
        },
        onSuccess: function () {
            EditView.prototype.onSuccess.apply(this, pslice.call(arguments))
            var id = this.modelInstance.id;
            require(['views/' + id + '/list',
                'text!templates/' + id + '/table.html.raw',
                'text!templates/' + id + '/table-item.html.raw'

            ], this.doModify.bind(this));
        },
        doModify: function (View, table, tableItem) {
            _.extend(View.prototype, this.createConfig(table, tableItem));
        },
        createConfig: function (table, tableItem) {
            var list = this.form.getValue().list;
            var obj = {
                model: {
                    list_fields: list.map(function (v) {
                        return v.property;
                    }),
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
            var renderer = new Renderer();
            _.each(list, renderer.add, renderer);
            return {
                template: _.template(jqtpl.render(table, obj)),
                listItemTemplate: _.template(jqtpl.render(tableItem, obj)),
                renderer: renderer
            }
        },
        createModel:function(opts){
            var model = new this.model(opts);
            model.schema.list.model.prototype.schema.property.url = '${pluginUrl}/admin/properties/'+opts.id+'?'


            return model;

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
        createTemplate: _.template('<i class="icon-plus"></i>Create New <%=title%>'),
        editTemplate: _.template('<i class="icon-edit"></i> Edit <%=title%>'),
        fields: ['list'],
        template: _.template(template),
        config: {
            title: 'List View'
        }
    });
});