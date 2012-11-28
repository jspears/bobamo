define([ 'Backbone', 'modeleditor/js/form-model', 'views/modeleditor/admin/fieldset', 'views/modeleditor/admin/mongoose-types','exports', 'underscore', 'Backbone.Form'], function (b, Form, Fieldset, MongooseType, exports, _) {

    var Property = b.Model.extend({

        defaults:{
            name:null,
            title:null,
            help:null,
            type:'String',
            ref:null,
            multiple:false,
            virtual:false
        },
        schema:{
            name:{type:'Text', required:true},
            title:{type:'Text'},
            help:{type:'Text'},
            editor:{ title:'Editor Type', type:'Select', options:[], help:'The Editor type helps choose the correct way to change a value for the form.'},
            placeholder:{type:'Text', help:'Default Placeholder text'},

            persistence:{
                type:'NestedModel',
                model:MongooseType,
                title:'Mongoose Configuration',
                help:'Mongoose specific configuration and persistence'
            },
            multiple:{
                type:'Checkbox',
                help:'Multiple values as an Array'

            },
            fieldsets:{
                type:'List',
                itemType:'NestedModel',
                model:Fieldset,
                help:'Fields to allow editing',
                title:'Edit Fields'
            },
            list_fields:{
                type:'List',
                help:'Fields to show in list views',
                title:'List Fields'
            }
        },
        fieldsets:[
            { legend:'Property', fields:['name', 'multiple']},
            { legend:'Persistence', fields:['persistence']},
            { legend:'Display', fields:['title', 'help']},
            { legend:'Editor', fields:['placeholder', 'editor', 'fieldsets', 'list_fields']}
        ],
        toString:function () {
            var description = this.get('help');
            return this.get('name') + (description ? ' - ' + description : '');
        },
        createForm:function (opts) {

            opts.fieldsets = this.fieldsets;
            opts._parent = this;

            var form = this.form = new Form(opts);
            var title = this.get('path') || this.get('name');
            if (title)
               form.title = 'Property ['+title+']';
            var self = this;

            function onType(c1,c2,c3){
                var value = form.getValue();
                var dataType = form.fields.persistence.editor.form.fields.dataType.getValue();
                console.log('type', dataType);
                form.fields.editor.editor.setOptions(function(cb){
                    $.getJSON('${pluginUrl}/admin/editors/'+dataType, function(resp){
                        cb(resp.payload);
                    })
                    var schema =    form._root.presave()
                    $.ajax({
                        type:'POST',
                        url:'${pluginUrl}/admin/editorsFor',
                        data:{
                            path:value.path || value.name,
                          property:value,
                          schema:schema
                        },
                        success:function(resp){
                            console.log('success', arguments);
                        }
                    })

                })
                var show, hide;
                (dataType == 'Object' || dataType == 'ObjectId') ? (show = 'show', hide='hide') : (show = 'hide', hide='show');

                form.fields.fieldsets.$el[dataType == 'ObjectId' ? 'hide' : show]();
                form.fields.list_fields.$el[dataType == 'ObjectId' ? 'hide' : show]();
               // form.fields.editor.$el[hide]();
                form.fields.placeholder.$el[hide]();
                form.fields.title.$el[hide]();
                form.fields.help.$el[hide]();

            }
            form.on("render", onType)
            form.on("persistence:render", onType);
            form.on("persistence:dataType:change", onType);
            $('.form-horizontal', form.$el).wiz({stepKey:'_propStep'});

            return form;
        }
    });
 //   Property.prototype.schema.paths.model = Property;
    exports.property = function(){
        return Property;
    }


    return Property;
})