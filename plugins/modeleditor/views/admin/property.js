define(['Backbone', 'modeleditor/js/form-model', 'views/modeleditor/admin/fieldset', 'views/modeleditor/admin/mongoose-types', 'underscore', 'Backbone.Form'], function (b, Form, Fieldset, MongooseType, _) {

    var Property = b.Model.extend({

        defaults:{
            name:null,
            title:null,
            description:null,
            type:'String',
            ref:null,
            many:false
        },
        schema:{
            name:{type:'Text', required:true},
            title:{type:'Text'},
            description:{type:'Text'},
            editor:{ title:'Editor Type', type:'Select', options:[], help:'The Editor type helps choose the correct way to change a value for the form.'},
            placeholder:{type:'Text', help:'Default Placeholder text'},
            schemaType:{
                type:'Select',
                help:'Type of schema',
                required:true,
                options:_.keys(MongooseType.prototype._schemaTypes)
            },
            validation:{
                type:'NestedModel',
                model:MongooseType
            },

            many:{
                type:'Checkbox',
                help:'Multiple values as an Array'

            },
            paths:{
                type:'List',
                itemType:'NestedModel',
                required:true,
                title:'Properties',
                help:'This is where you add properties to this object.'
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
            { legend:'Property', fields:['name', 'many', 'schemaType', 'paths']},
            { legend:'Validation', fields:['validation']},
            { legend:'Display', fields:['title', 'description']},
            { legend:'Editor', fields:['placeholder', 'editor', 'fieldsets', 'list_fields']}
        ],
        toString:function () {
            var self = this.toJSON();
            var description = this.get('description');
            return this.get('name') + (description ? ' - ' + description : '');
        },
        createForm:function (opts) {

            opts.fieldsets = this.fieldsets;

            var f = opts.fieldsets[0];

            if (opts._parent && opts._parent.options && opts._parent.options.list && opts._parent.options.list.form) {
                var pform = opts._parent.options.list.form;
                var val = pform.fields.modelName || pform.fields.name;
                var label = val.editor.getValue();
                f.legend = 'Property on "' + label + '"';
            }
            opts._parent = this;

            var form = new Form(opts);

            var self = this;

            function validation() {
                var val = form.fields.schemaType.getValue();
                var vform = form.fields.validation.editor.form;
                _.each(vform.fields, function (v, k) {
                    v.$el[val == k ? 'show' : 'hide']();
                });
                var isObj = val == 'Object';
                var show = isObj ? 'show' : 'hide';
                form.fields.paths.$el[show]();
                form.fields.fieldsets.$el[show]();
                form.fields.list_fields.$el[show]();
                form.fields.title.$el[isObj ? 'hide' : 'show']();
                form.fields.description.$el[isObj ? 'hide' : 'show']();
                form.fields.validation.$el[isObj ? 'hide' : 'show']();
                form.fields.editor.editor.setOptions(function (cb) {
                    $.getJSON('${pluginUrl}/admin/editors/' + val, function (resp) {
                        cb(resp.payload);
                    });
                })
            }

            form.on('schemaType:change', validation);
            form.on('render', validation);
            var enableAdd = function () {
                if (this.fields.name.getValue()) {
                    this.fields.paths.$el.find('button').removeAttr('disabled');
                } else {
                    this.fields.paths.$el.find('button').attr('disabled', 'true');
                }
            };
            form.on('name:change', enableAdd);
            form.on('render', enableAdd);


            // form.on('validators:change', validators);
            $('.form-horizontal', form.$el).wiz({stepKey:'_propStep'});

            return form;
        }
    });
    Property.prototype.schema.paths.model = Property;
    return Property;
})