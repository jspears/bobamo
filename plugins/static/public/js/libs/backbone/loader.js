define(['jquery', 'order!libs/underscore/underscore-1.3.1-amd', 'order!libs/backbone/backbone-0.9.1-amd'],
function(jQuery){
  return {
    Backbone: Backbone.noConflict(),
    _: _.noConflict(),
    $: jQuery.noConflict()
  };
});
