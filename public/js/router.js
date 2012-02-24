// Filename: router.js
define([
  'jQuery',
  'Underscore',
  'Backbone'], function($, _, Backbone ){
  var AppRouter = Backbone.Router.extend({
    routes: {
      '*actions': 'defaultAction'
    },
    defaultAction: function(actions){
      // We have no matching route, lets display the home page
        var paths = (actions || 'home' ).replace(/^\/*/,'').split('/');
        require(['/js/views/'+paths[0]+'/list.js'], function(View){
           View.render();
        });
    }
  });

  var initialize = function(){
    var app_router = new AppRouter;
    Backbone.history.start();
  };
  return { 
    initialize: initialize
  };

});
