define([
    'Underscore',
    'Backbone'
], function(_, Backbone) {
    "use strict";
    //we define these together because they often link together and if they are in seperate callbacks bad things happen.
  //  var defaults = {{html _defaults()}};
    var schema = {{html JSON.stringify(schema.schemaFor('edit_fields'))}};
    var Model = Backbone.Model.extend({
 urlRoot:'/${api}/${schema.modelName}',
        schema:schema,
       // defaults:defaults,
        initialize: function() {
        }
        ,parse:function(resp) {
            console.log('/${api}/${schema.modelName}model#parse', resp);
            return resp.payload ? resp.payload : resp;
        }

    });
    var Collection = Backbone.Collection.extend({
        model: Model,
        url:'/${api}/${schema.modelName}',
        initialize: function() {

        },
        parse:function(resp) {
            console.log('Collection#parse ${schema.modelName}', resp.payload);
            return resp.payload ? resp.payload : resp;
        }
    });


    return {
        Model:Model,
        Collection:Collection
    };

});
