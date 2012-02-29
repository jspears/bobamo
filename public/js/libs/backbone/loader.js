define(['order!libs/jquery/jquery-min', 'order!libs/underscore/underscore-1.3.1-amd', 'order!libs/backbone/backbone-0.9.1-amd'],
function(){
  return {
    Backbone: Backbone.noConflict(),
    _: _.noConflict(),
    $: jQuery.noConflict()
  };
});
