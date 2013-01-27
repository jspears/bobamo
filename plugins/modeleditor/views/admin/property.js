define([ 'Backbone', 'modeleditor/js/form-model', 'views/modeleditor/admin/fieldset', 'views/modeleditor/admin/editors', 'views/modeleditor/admin/mongoose-types', 'exports', 'underscore', 'Backbone.Form', 'libs/editors/typeahead-editor'], function (b, Form, Fieldset, Editors, MongooseType, exports, _) {
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

    function editorsFor(val) {
        var editors = [];
        _.each(Editors, function (v, k) {
            if (v && v.types) {

                if (~v.types.indexOf(val))
                    editors.push(k);
            } else {
                editors.push(k)
            }
        });
        return editors;
    }

    var Property = b.Model.extend({

        defaults:{
            name:null,
            title:null,
            help:null,
            type:'Text',
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
            type:{ title:'Editor Type', type:'Select', options:[], help:'The Editor type helps choose the correct way to change a value for the form.'},
            editor:{
                type:'NestedModel',
                model:b.Model.extend({
                    createForm:function (args) {
                        args.model.schema = Editors;
                        var form = new Form(args)
                        return form;
                    }
                })
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
            modelName:{
                "type":"FilterText",
                filter:/^[a-zA-Z_]([a-zA-Z0-9,_,-,$])*$/,
                help:'Optional schema name, useful to reuse schema fragments'
            }
        },
        fieldsets:[
            { legend:'Property', fields:['name', 'multiple', 'hidden', 'modelName']},
            { legend:'Persistence', fields:['persistence']},
            { legend:'Display', fields:['title', 'help']},
            { legend:'Editor', fields:['type', 'editor']}
            //    { legend:'Editor', fields:[ 'type', 'placeholder', 'dataType', 'fieldsets', 'list_fields']}
        ],
        toString:function () {
            var description = this.get('help');
            return this.get('name') + (description ? ' - ' + description : '');
        },
        createForm:function (opts) {

            opts.fieldsets = _(this.fieldsets).chain().map(function(v){ return _.extend({}, v)}).value();

            var form = this.form = new Form(opts);
            var title = this.get('path') || this.get('name');
            if (title)
                form.title = 'Property [' + title + ']';
            var self = this;

            function onSchema(c1, c2, field) {
                var val = field && field.$el.val();
                console.log('onSchema', val);
                var first, second, third, pos = -1;
                _.each(Editors, function (v, k) {
                    if (k == val)
                        first = k;
                    else if (v && v.types) {
                        var idx = v.types.indexOf(val);
                        if (idx > pos) {
                            third = k;
                            pos = idx;

                        }
                    }
                });
                var editor =  form.fields.type.editor;
                editor.setOptions(
                    function (cb) {
                        editor.value = first || second || third || 'Text';
                        cb(editorsFor(val));
                        onType();
                    });

            }

            function onType() {
                var type = form.fields.type.editor.value;
                console.log('onType', type);
                var fields = form.fields.editor.editor.form.fields;
                _.each(_.omit(fields, type), function (f) {
                    f.$el.hide();
                })
                if (type&& fields[type])
                    fields[type].$el.show();
                else{
                    console.log('no fields for type', type, 'fields', fields);
                }
            }

            form.on("hidden:change", onType);
            function onEditor(c1, field) {
                var newValue = field && field.$el.val() || form.fields.type.value;
                console.log('onEditor', newValue);
                form.fields.type.editor.setOptions(
                    function (cb) {
                        form.fields.type.editor.value = newValue;
                        cb(editorsFor(form.fields.persistence.editor.form.fields.schemaType.getValue()));
                    });
            }

            form.on("render", onEditor);
            form.on("render", onType);
            form.on("type:change", onEditor);
//
            form.on("type:change", onType);
            form.on("persistence:render", onType);
            form.on("persistence:schemaType:change", onSchema);
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