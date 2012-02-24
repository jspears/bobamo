define([
  'jQuery',
  'Underscore',
  'Backbone',
  'models/${schema.modelName}'
], function($, _, Backbone, Model){
  var ${schema.modelName}Collection = Backbone.Collection.extend({
    model: Model,
    url:'/rest/${schema.modelName}',
    initialize: function(){

    },
    parse:function(resp){ return resp.payload}



  });

  return new ${schema.modelName}Collection;
});
