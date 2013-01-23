// Author: Thomas Davis <thomasalwyndavis@gmail.com>
// Filename: main.js

// Require.js allows us to configure shortcut alias
// Their usage will become more apparent futher along in the tutorial.
require.config({
  baseUrl:'${baseUrl}js',

  paths: {
    loader: 'libs/backbone/loader',
    async:'libs/require/async',
    json:'libs/require/json',
    underscore: 'libs/underscore/underscore-1.4.2',
    Backbone: 'libs/backbone/backbone-0.9.2',
   'jquery-ui':'libs/backbone-forms/editors/jquery-ui',
   'Backbone.Form':'libs/bobamo/backbone-forms',
   'Backbone.FormOrig':'libs/backbone-forms/backbone-forms',
   'jquery-editors':'libs/backbone-forms/editors/list',
   'bootstrap':'libs/bootstrap/js',
    templates: '../templates',
   'backbone-modal':'libs/backbone-forms/editors/backbone.bootstrap-modal',

{{each(j,k) pluginManager.pluginNames()}}
    ${j}:'${baseUrl}${j}',
{{/each}}
    tpl: '../tpl'
  }

});

require([
  "${query.app || 'app'}"
], function(App){
  // The "app" dependency is passed in as "App"
  // Again, the other dependencies passed in are not "AMD" therefore don't pass a parameter to this function
//  App.initialize();
//    return App;
});
