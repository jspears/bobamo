define([
    'underscore',
    'Backbone',
    'libs/mojaba/edit',
    'text!templates/admin/${schema.modelName}/edit.html'
], function (_,Backbone, EditView, template) {
    "use strict";

    var fieldsets = {{html JSON.stringify(schema.fieldsets) }};
    var schema = {{html JSON.stringify(schema.schemaFor()) }};

    var Model = Backbone.Model.extend({
        schema:schema,
        url:'admin/model/${schema.modelName}',
        parse:function(resp){
            console.log('response',resp);
            return resp.payload;
        },
        idAttribute:'modelName',
        get:function(key){
            if (key && key.indexOf('.') > -1){
                var split = key.split('.');
                var val = this.attributes;
                while (split.length && val)
                    val = val[split.shift()];

                return val;
            }
            return Backbone.Model.prototype.get.call(this, key);
        }

    });
    return EditView.extend({
        fieldsets:fieldsets,
        template:_.template(template),
//        collection:collection,
        model:Model,
        isWizard:true,
        config:{
            title:'Model',
            plural:'Models',
            modelName:'${schema.modelName}'
        }
    });
});
