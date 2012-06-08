define([
    'underscore',
    'Backbone'
], function(_, Backbone) {
    "use strict";
    //we define these together because they often link together and if they are in seperate callbacks bad things happen.
  //  var defaults = {{html _defaults()}};
    var schema = {{html JSON.stringify(model.schemaFor(model.fieldsets || model.edit_fields))}};
    var Model = Backbone.Model.extend({
        urlRoot:'${api}/${model.modelName}',
        schema:schema,
        parse:function(resp) {
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
             this.total = 0;
        },
        parse:function(resp) {
            console.log('Collection#parse ${model.modelName}', resp.payload);
            this.total = resp.total;
            return resp.payload ? resp.payload : resp;
        }
    });


    return {
        Model:Model,
        Collection:Collection
    };

});
