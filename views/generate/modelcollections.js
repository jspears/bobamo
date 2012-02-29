define([
    'Underscore',
    'Backbone'
], function(_, Backbone) {
    "use strict";
    //we define these together because they often link together and if they are in seperate callbacks bad things happen.
    var ${schema.modelName}Model = Backbone.Model.extend({
        urlRoot:'/rest/user',
        defaults: {
            score: 10
        },
        initialize: function() {
        },
        parse:function(resp) {
            resp.payload;
        }

    });
    var ${schema.modelName}Collection = Backbone.Collection.extend({
        model: ${schema.modelName}Model,
        url:'/rest/${schema.modelName}',
        initialize: function() {

        },
        parse:function(resp) {
            return resp.payload
        }
    });


    return {
        model:${schema.modelName}Model,
        collection:${schema.modelName}Collection
    };

});
