define(['Backbone', 'Backbone.Form/form-model',
    'libs/bobamo/edit',
    'libs/util/inflection',
    'libs/renderer/renderers',
    'libs/jquery/jqtpl',
    'backbone-modal',
    'text!modeleditor/views/templates/admin/list-edit.html',
    'libs/jquery/jquery.busy'


], function (B, Form, EditView, inflection, Renderer, jqtpl, modal, template) {
    _.extend(Form.templates, {
        listItemReorder: Form.helpers.compileTemplate('<li class="edit-item-li">\
            <div class="bbf-editor-container">\{\{editor\}\}</div>\
            <div class="edit-control">\
                 <button type="button" data-action="remove" class="bbf-remove"><i class="icon-remove"></i></button>\
                 <button type="button" data-action="moveUp" class="bbf-moveUp"><i class="icon-chevron-up"></i></button>\
                 <button type="button" data-action="moveDown" class="bbf-moveDown"><i class="icon-chevron-down"></i></button>\
            </div>\
            <div class="clearfix"> </div>\
      </li>')
    });
    var swapItems = function (list, a, b) {
        list[a] = list.splice(b, 1, list[a])[0];
        return list;
    }
    var LIP = Form.editors.List.Item.prototype;
    var oremove = LIP.remove;
    LIP.remove = function () {
        this.$el.remove();
        oremove.call(this);
    };
    _.extend(LIP.events, {
        'click [data-action="moveUp"]': function (event) {
            event.preventDefault();
            this.$el.insertBefore(this.$el.prev());
            var list = this.list, items = list.items, idx = items.indexOf(this);
            swapItems(items, idx - 1, idx);
            list.trigger('change', this);
        },
        'click [data-action="moveDown"]': function (event) {
            event.preventDefault();
            this.$el.insertAfter(this.$el.next());
            var list = this.list, items = list.items, idx = items.indexOf(this);
            swapItems(items, idx, idx + 1);
            list.trigger('change', this);
        }

    })
    Form.editors.ReorderList = Form.editors.List.extend({});
    var RenderCollection = B.Collection.extend({
        url: '${baseUrl}renderer/renderers',
        parse: function (resp) {
            return resp.payload
        },
        model: B.Model.extend({
            idAttribute:'_id',
            toString: function () {
                return this.get('_id');
            }
        })
    });
    var rendererCollection = new RenderCollection;
    rendererCollection.fetch();
    var RenderModel = B.Model.extend({
        url: '${baseUrl}/modeleditor/admin',
        fields: ['property', 'title', 'renderer'],
        toString: function () {
            return  '<div><h3>' + this.get('title') + '</h3>' +
                '<small>' +
                this.get('property')
                + ' renderer: ' + (this.get('renderer') || 'Default');
            +'</small></div>'
        },
        schema: {
            renderer: {
                type: 'Select',
                title:'Renderer <a href="#views/renderer/admin/list">configure</a>',
                options: rendererCollection
            },
            title: {
                type: 'Text'
            },
            property: {
                type: 'Text',
                validators: [
                    {type: 'required'}
                ]
            }
        }
    })
    var model//${nl}={{json model.model }}

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
            parse:function(resp){
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
            require(['views/' + model.modelName + '/list',
                'text!templates/' + model.modelName + '/table.html.raw',
                'text!templates/' + model.modelName + '/table-item.html.raw'

            ], this.doPreview);

        },
        doPreview: function (View, table, tableItem) {
            if (this.preView)
                this.preView.remove();
            var list = this.form.getValue().list;
            var obj = {
                model: {
                    list_fields: list.map(function (v) { return v.property; }),
                    pathFor: function (property) {
                        for (var i= 0,l=list.length;i<l;i++){
                            var itm = list[i];
                            if (itm && itm.property == property)
                                return itm;
                        }
                        return {title:property}

                    }
                }
            };
            var renderer = new Renderer();
            _.each(list, renderer.add, renderer);
            var NView = View.extend({
                template: _.template(jqtpl.render(table, obj)),
                listItemTemplate: _.template(jqtpl.render(tableItem, obj))
            });
            var v = this.preView = new NView({
                renderer: renderer
            });
            v.render({
                container: this.$preview
            });
            this.$preview.busy('remove');
        },
        render: function () {
            EditView.prototype.render.call(this, {id: model.modelName});
            this.form.on('change', this.onPreview, this);
            return this;
        },

        buttons: _.extend(EditView.prototype.buttons, {
            left: EditView.prototype.buttons.left.concat(
                {
                    html: 'Preview',
                    events: {
                        'click .preview': 'onPreview'
                    },
                    clsNames: 'preview'
                })
        }),
        listUrl: function () {
            return "#${pluginUrl}/views/admin/list"
        },
//        createTemplate: _.template('<i class="icon-plus"></i>Create New <%=title%>'),
        editTemplate: _.template('<i class="icon-edit"></i> Edit List View for ' + model.modelName),
        fields: ['list'],
        template: _.template(template),
        config: {
            modelName: model.modelName,
            plural: model.plural,
            title: 'List View for ' + model.modelName
        }
    });
});