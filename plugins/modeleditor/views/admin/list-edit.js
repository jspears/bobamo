define(['Backbone', 'Backbone.Form/form-model',
    'libs/bobamo/edit',
    'libs/util/inflection',
    'backbone-modal',
    'text!modeleditor/views/templates/admin/list-edit.html'

], function (B, Form, EditView, inflection, modal, template) {
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
    var swapItems = function(list, a, b){
        list[a] = list.splice(b, 1, list[a])[0];
        return list;
    }
    var LIP = Form.editors.List.Item.prototype;
    var oremove = LIP.remove;
    LIP.remove = function(){
        this.$el.remove();
        oremove.call(this);
    };
    _.extend(LIP.events, {
        'click [data-action="moveUp"]': function(event) {
            event.preventDefault();
            console.log('moveUp', this.list);
            this.$el.insertBefore(this.$el.prev());
            var idx = this.list.items.indexOf(this);
            swapItems(this.list.items, idx-1, idx);
        },
        'click [data-action="moveDown"]': function(event) {
            event.preventDefault();
            console.log('moveDown', this.list);
            this.$el.insertAfter(this.$el.next());
            var idx = this.list.items.indexOf(this);
            swapItems(this.list.items, idx, idx+1);
        }

    })
    Form.editors.ReorderList = Form.editors.List.extend({

    });
    var RenderCollection = B.Collection.extend({
        url: '${baseUrl}renderer/renderers',
        parse: function (resp) {
            return resp.payload
        },
        model: B.Model.extend({
            toString: function () {
                return this.get('_id');
            }
        })
    });
    var renderers = new RenderCollection;
    var RenderModel = B.Model.extend({
        url: '${baseUrl}/modeleditor/admin',
        fields: ['property', 'header', 'renderer', 'sort'],
        buttons:{

        },
        toString: function () {
            return  '<div><h3>' + this.get('header') + '</h3>' +
                '<small>' +
                this.get('property')
                + (this.get('sort') ? ' sorting :' + this.get('sort') : '' )
                + ' renderer: ' + (this.get('renderer') || 'Default');
            +'</small></div>'
        },
        schema: {
            renderer: {
                type: 'Select',
                collection: renderers
            },
            sort: {
                type: 'Select',
                options: [
                    {label: 'Default'},
                    {label: 'Ascending', val: 1},
                    {label: 'Descending', val: -1 }
                ]
            },
            header: {
                type: 'Text',
                validators: [
                    {type: 'required'}
                ]
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
    var defaults = [];
    _.each(model.list_fields, function (v, k) {
        var s = model.schema[v]
        defaults.push({
            property: v,
            header: s && s.title || v
        })
//        schema[v] = {
//            type:'NestedModel',
//            model:RenderModel,
//            title:'Property ['+v+']'
//        }
    });
    console.log('schema', schema, 'fields', defaults);
    return EditView.extend({
        model: B.Model.extend({
            schema: schema,
            defaults: {list: defaults},
            urlRoot:'${pluginUrl}/admin/list'
        }),
        onPreview:function(){

        },
        render:function(){
            EditView.prototype.render.call(this, {id:model.modelName});
            return this;
        },

        buttons: _.extend(EditView.prototype.buttons, {
            center:[
                {
                    html:'Preview',
                    events:{
                        'click .preview':'onPreview'
                    },
                    clsNames:'preview'
                }
            ]
        }),
        listUrl:function(){
          return "#${pluginUrl}/views/admin/list"
        },
//        createTemplate: _.template('<i class="icon-plus"></i>Create New <%=title%>'),
        editTemplate: _.template('<i class="icon-edit"></i> Edit List View for ' + model.modelName),
        fields: ['list'],
        template: _.template(template),
        config: {
            modelName:model.modelName,
            plural: model.plural,
            title: 'List View for ' + model.modelName
        }
    })


});