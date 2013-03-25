define(['underscore', 'Backbone', 'modeleditor/views/admin/display-model',
    'modeleditor/views/admin/property', 'modeleditor/views/admin/fieldset'], function(_, Backbone, Display, Property, Fieldset ){
    return Backbone.Model.extend({
        schema:{
            "modelName":{
                "title":"Model Name",
                "help":"The model name of the object",
                "type":"FilterText",
                filter:/^[a-zA-Z_]([a-zA-Z0-9,_,-,$])*$/,
                validators:['required']
            },
            description:{
                title:'Description',
                help:'A description of the model for documentation',
                type:'TextArea'
            },

            display:{
                type:'NestedModel',
                model:Display
            },
            "schema":{
                type:'List',
                itemType:'NestedModel',
                model:Property,
                title:'Properties',
                help:'This is where you add properties to this object.'
            },
            fieldsets:{
                type:'List',
                title:'Edit View',
                help:'Fields to allow editing',
                itemType:'NestedModel',
                model:Fieldset
            },
            list_fields:{
                type:'List',
                itemType:'TypeAhead',
                options:[],
                title:'List View',
                help:'Fields to show in list views'
            }
        },
        urlRoot:"${pluginUrl}/admin/backbone/",
        save:function () {
            var data = this.presave();
            var arr = _.toArray(arguments);
            arr.splice(0, 1, data);
            Backbone.Model.prototype.save.apply(this, arr);
        },

        parse:function (resp) {
            var model = resp.payload;
            var paths = model.schema;
            delete model.schema;
            var npaths = (model.schema = []);

            function fixPaths(p) {
                return function (v, k) {
                    if (!v.name)
                        v.name = k;
                    p.push(v);
                    var model = resp.payload;
                    var display = {
                        labelAttr:model.labelAttr,
                        title:model.title,
                        help:model.help,
                        plural:model.plural,
                        hidden:model.hidden || model.display == 'none'
                    };
                    delete model.labelAttr;
                    delete model.title;
                    delete model.help;
                    delete model.plural;
                    delete model.hidden;

                    _.extend(model.display || (model.display = {}), display);
                    v.multiple = v.type == 'Array' || v.multiple;

                    if (v.ref) {
                        v.schemaType = 'ObjectId';
                    } else if (!v.schemaType)
                        v.schemaType = 'Object';
                    var persistence = (v.persistence = {schemaType:v.schemaType})[v.schemaType] = v;

                    if (v.validators && v.validators.length) {
                        v.validators = _.map(v.validators, function (v, k) {
                            var ret = {
                                type:v.type,
                                message:v.message,
                                configure:{}
                            }
                            ret.configure[v.type] = _.omit(v, 'type', 'message')
                            return ret;
                        });
                    }

                    (v.editor || (v.editor={}))[v.type] = _.omit(v, 'persistence', 'subSchema', 'schema', 'schemaType','title','plural', 'labelAttr','title','help','plural','validators','hidden');
                    if (v.subSchema) {
                        var sub = v.subSchema;
                        v.schemaType = 'Object';
                        delete v.subSchema;
                        var np = (v.schema = []);
                        _.each(sub, fixPaths(np));
                    }
                }

            }

            _.each(paths, fixPaths(npaths));
            return model;
        },

        defaults:{
            hidden:false
        },
        idAttribute:'modelName'
    });

})