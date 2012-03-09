// Filename: router.js
define([
    'jquery',
    'Underscore',
    'Backbone',
    'libs/querystring'], function ($, _, Backbone, query) {
    var AppRouter = Backbone.Router.extend({
        routes:       {
            'login/login*':'doLoginHome',
            'login/*actions':'doLogin',
            '*actions':'defaultAction'
        },
        doLoginHome:function(){
            this.doLogin('/home')
        },
        doLogin:function(actions){
            console.log('doLogin', arguments);
            var self = this;
            return require(['/js/views/login/login.js'], function (View) {
                new View({router:self}).render('/'+(actions ? actions.indexOf('login') > -1 ? '/home'  : actions : '/home'));
            });
        },
        views:        {},
        defaultAction:function (actions) {
            // We have no matching route, lets display the home page
            var parts = (actions || 'home' ).replace(/^\/*/, '').split('?', 2);
            var self = this;
            if (!window.isAuthenticated ) {
                return this.navigate('#login/'+actions, {trigger:true, replace:true});
             }

            var paths = parts[0].split('/');
            var obj = {};
            if (parts.length > 1) {
                obj = query.parse(parts[1]);
            }
            var path = ['/js/views'];
            if (paths.length == 1) {
                path.push(paths[0])
                path.push('list');
            } else {
                path = path.concat(paths);
            }
            var p = path.join('/');
            console.log('path=', p, 'params=', obj);
            require([p + '.js'], function (View) {
                console.log('rendering ', p, View);
                var view = self.views[p] || (self.views[p] = new View({router:AppRouter, container:'#content'}));
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
