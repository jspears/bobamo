var id = window.location.hash.replace(/.*id=([^&]*).*/, "$1");
console.log('id', id);
define([
    'underscore',
    'Backbone',
    'libs/mojaba/edit',
    'text!/../mojaba/admin/'+id,
    'text!tpl/admin/edit.html'
], function (_,Backbone, EditView, collection, template) {
    "use strict";
    var resp = JSON.parse(collection).payload;

    var fieldsets = resp.fieldsets;
    delete resp.fieldsets;
    delete resp.edit_fields;
    delete resp.list_fields;
    console.log('fieldsets', fieldsets);
    var Model = Backbone.Model.extend({
        schema:resp,
        url:'admin/model/'+id,
        parse:function(resp){
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
            modelName:id
        }
    });
});
