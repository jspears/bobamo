define([
    'underscore',
    'Backbone'
], function(_, Backbone) {
    "use strict";

    //we define these together because they often link together and if they are in seperate callbacks bad things happen.

    var schema = {{html JSON.stringify(model.schemaFor(model.fieldsets || model.edit_fields))}};
    var defaults = {{html JSON.stringify(model.defaults)}};

    var Model = Backbone.Model.extend({
        urlRoot:'${api}/${model.modelName}',
        schema:schema,
        defaults:defaults,
        initialize: function() {
        }
        ,parse:function(resp) {
            console.log('/${api}/${model.modelName}model#parse', resp);
            return resp.payload ? resp.payload : resp;
        },
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
    var Collection = Backbone.Collection.extend({
        model: Model,
        url:'${api}/${model.modelName}',
        initialize: function() {

        },
        parse:function(resp) {
            console.log('Collection#parse ${model.modelName}', resp.payload);
            return resp.payload ? resp.payload : resp;
        }
    });


    return {
        Model:Model,
        Collection:Collection
    };

});
