define([
    'Underscore',
    'Backbone'
], function(_, Backbone) {
    "use strict";
    //we define these together because they often link together and if they are in seperate callbacks bad things happen.
    var defaults = {{html _defaults()}};
    var schema = {{html _paths()}};
    var Model = Backbone.Model.extend({
        urlRoot:'${baseUrl}/${api}/${schema.modelName}',
        schema:schema,
       // defaults:defaults,
        initialize: function() {
        }
        ,parse:function(resp) {
            console.log('${baseUrl}/${api}/${schema.modelName}model#parse', resp);
            return resp.payload ? resp.payload : resp;
        }

    });
    var Collection = Backbone.Collection.extend({
        model: Model,
        url:'${baseUrl}/${api}/${schema.modelName}',
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
