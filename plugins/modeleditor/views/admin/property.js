define([ 'Backbone', 'modeleditor/js/form-model', 'views/modeleditor/admin/fieldset', 'views/modeleditor/admin/mongoose-types', 'exports', 'underscore', 'Backbone.Form'], function (b, Form, Fieldset, MongooseType, exports, _) {
    var DataTypes = {
        'String':[
            'text',
            'password',
            'color',
            'date',
            'datetime',
            'datetime-local',
            'email',
            'month',
            'number',
            'range',
            'search',
            'tel',
            'time',
            'url',
            'week'],
        'Number':[
            'number',
            'range',
            'week']
    }
    var Property = b.Model.extend({

        defaults:{
            name:null,
            title:null,
            help:null,
            type:'String',
            ref:null,
            multiple:false,
            virtual:false,
            hidden:false
        },
        schema:{
            name:{type:'Text', required:true},
            hidden:{type:'Checkbox'},
            title:{type:'Text'},
            help:{type:'Text'},
            editor:{ title:'Editor Type', type:'Select', options:[], help:'The Editor type helps choose the correct way to change a value for the form.'},
            dataType:{
                type:'Select',
                help:'HTML5 data type to use on input',
                options:[
                    'text',
                    'password',
                    'color',
                    'date',
                    'datetime',
                    'datetime-local',
                    'email',
                    'month',
                    'number',
                    'range',
                    'search',
                    'tel',
                    'time',
                    'url',
                    'week']
            },
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
            { legend:'Property', fields:['name', 'multiple', 'hidden']},
            { legend:'Persistence', fields:['persistence']},
            { legend:'Display', fields:['title', 'help']},
            { legend:'Editor', fields:['placeholder', 'editor', 'dataType', 'fieldsets', 'list_fields']}
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
                form.title = 'Property [' + title + ']';
            var self = this;
            function onType(c1, c2, c3) {
                var value = form.getValue();
                var hidden = form.fields.hidden.getValue();
                var schemaType = form.fields.persistence.editor.form.fields.schemaType.getValue();
                console.log('type', schemaType);
                if (hidden)
                    form.fields.editor.$el.hide();
                else
                    form.fields.editor.editor.setOptions(function (cb) {
                        $.getJSON('${pluginUrl}/admin/editors/' + schemaType, function (resp) {
                            cb(resp.payload);
                        })
                    })

                var show, hide;
                (hidden || schemaType == 'Object' || schemaType == 'ObjectId') ? (show = 'show', hide = 'hide') : (show = 'hide', hide = 'show');

                form.fields.fieldsets.$el[hidden || schemaType == 'ObjectId' ? 'hide' : show]();
                form.fields.list_fields.$el[ hidden || schemaType == 'ObjectId' ? 'hide' : show]();
                // form.fields.editor.$el[hide]();
                form.fields.placeholder.$el[hide]();
                form.fields.title.$el[hide]();
                form.fields.help.$el[hide]();
                var dataType = form.fields.dataType;
                if (DataTypes[schemaType]) {
                    dataType.$el.show();
                    var options = DataTypes[schemaType];
                    var val = (self.get('name') || '').toLowerCase();

                    if ( val && ~options.indexOf(val)){
                        dataType.editor.value = val;
                    }
                    dataType.editor.setOptions(DataTypes[schemaType]);

                } else {
                    form.fields.dataType.$el.hide();
                }

            }
            form.on('name:change', function(){

            });
            form.on("hidden:change", onType);
            form.on("render", onType)
            form.on("persistence:render", onType);
            form.on("persistence:schemaType:change", onType);
            $('.form-horizontal', form.$el).wiz({stepKey:'_propStep'});

            return form;
        }
    });
    //   Property.prototype.schema.paths.model = Property;
    exports.property = function () {
        return Property;
    }


    return Property;
})