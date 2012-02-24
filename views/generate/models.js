define([
  'Underscore',
  'Backbone'
], function(_, Backbone) {
  var ${schema.modelName}Model = Backbone.Model.extend({
    defaults: {
      score: 10
    },
    initialize: function(){
    }

  });
  return ${schema.modelName}Model;

});
