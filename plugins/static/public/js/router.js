// Filename: router.js
define([
    'jquery',
    'underscore',
    'Backbone',
  // 'libs/backbone/backbone.queryparams',
    'libs/querystring'], function ($, _, Backbone, query) {
    var AppRouter = Backbone.Router.extend({
        routes:       {
            'login/login*':'doLoginHome',
            'login/*actions':'doLogin',
           // '/views/:type/finder/:finder':'defaultAction',
            '*actions':'defaultAction'
        },
        doLoginHome:function(){
            this.doLogin('/home')
        },
        doLogin:function(actions){
            console.log('doLogin', arguments);
            var self = this;
            return require(['passport/js/views/login/login'], function (View) {
                new View({router:self}).render('/'+(actions ? actions.indexOf('login') > -1 ? '/home'  : actions : '/home'));
            });
        },
        views:        {},
        activeHeader:function(clz){
            var $main = $('.mainnav');
            $main.find('.active').removeClass('active');
            $main.find('.'+clz).addClass('active');

        },
        defaultAction:function (actions, params) {
            // We have no matching route, lets display the home page
            var parts = (actions || 'home' ).replace(/^\/*/, '').split('?', 2);
            var self = this;
            if (window.useAuthentication &! window.isAuthenticated ) {
                return this.navigate('#login/'+actions, {trigger:true, replace:true});
             }

            var paths = parts[0].split('/');
            var obj = {params:params};
            if (parts.length > 1) {
                obj = query.parse(parts[1]);
            }
            this.activeHeader(paths[0]);
            var path = ['views'];
            if (paths.length == 1) {
                path.push(paths[0])
                path.push('list');
            } else {
                path = path.concat(paths);
            }
            var p = path.join('/');
            console.log('path=', p, 'params=', obj);
            require([p], function (View) {
                console.log('rendering ', p, View);
               // var view = self.views[p] || (self.views[p] =
                var view = new View({router:AppRouter, container:'#content'}, obj);
                view[ view.show ? 'show' : 'render'](obj);
            });
        }
    });

    return {
        initialize:function initialize() {
            var app_router = new AppRouter;
            Backbone.history.start();
        }
    };

});
