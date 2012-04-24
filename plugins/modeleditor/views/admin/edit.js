define([
    'underscore',
    'Backbone',
    'libs/bobamo/edit',
    'text!${pluginUrl}/templates/admin/edit.html',
    'jquery-ui',
    'libs/backbone-forms/src/jquery-ui-editors',
    'libs/editors/multi-editor'
], function (_, Backbone, EditView, template) {
    "use strict";

    var fieldsets = eval('({{html JSON.stringify(model.fieldsets) }})');
    var schema = eval('({{html JSON.stringify(model.schemaFor()) }})');
    schema.fieldsets.itemToString = function (obj) {
        if (obj.fields && _.isString(obj.fields)){
              obj.fields = obj.fields.split(',');
        }
        var fields = '[' + obj.fields.join(',') + ']';
        if (fields.length > 30)
            fields = fields.substring(0, 27) + '...';

        return obj.legend + ' ' + fields;
    }
    var Model = Backbone.Model.extend({
        schema:schema,
        url:'${pluginUrl}/admin/model/${model.modelName}',
        parse:function (resp) {
            console.log('response', resp);
            return resp.payload;
        },
        idAttribute:'modelName',
        set:function (a, b, c, d) {
            return Backbone.Model.prototype.set.call(this, a, b, c, d)
        },
        get:function (key) {
            if (key && key.indexOf('.') > -1) {
                var split = key.split('.');
                var val = this.attributes;
                //"paths", "meta", "subSchema", "stars", "title"
                if (split.length > 3) {
                    var last = split.pop();
                    var ret = [split.shift()];
                    for (var i = 0, l = split.length; i < l; i++) {
                        ret.push(split[i]);
                        if (i + 1 <  l)
                        ret.push('subSchema');
                    }

                    ret.push(last)
                    split = ret;
                    console.log('splits',split.concat());
                }
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
            modelName:'${model.modelName}'
        }
    });
});
