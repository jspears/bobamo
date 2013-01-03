// Filename: router.js
define([
    'jquery',
    'underscore',
    'Backbone',
    'libs/querystring',
    'backbone-modal'
], function ($, _, Backbone, query, Modal) {
    var AppRouter = Backbone.Router.extend({
        routes:{
            'login/login*':'doLoginHome',
            'login/*actions':'doLogin',
            'modal/*actions':'doModal',
            // '/views/:type/finder/:finder':'defaultAction',
            '*actions':'defaultAction'
        },
        doModal:function (view) {

            var viewArr = _.isArray(view) ? view : [view];
            console.log('doModal', viewArr);
            require(viewArr, function (V) {

                var m = new Modal({
                    content:new V
                }).open(function () {
                        window.history.back();
                    })
            });
        },
        doLoginHome:function () {
            this.doLogin('/home')
        },
        doLogin:function (actions) {
            console.log('doLogin', arguments);
            var self = this;
            return require(['passport/js/views/login/login'], function (View) {
                new View({router:self}).render('/' + (actions ? actions.indexOf('login') > -1 ? '/home' : actions : '/home'));
            });
        },
        views:{},
        activeHeader:function (clz) {
            var $main = $('.mainnav');
            $main.find('.active').removeClass('active');
            $main.find('.' + clz).addClass('active');

        },

        defaultAction:function (actions, params) {
            // We have no matching route, lets display the home page
            var parts = (actions || 'home' ).replace(/^\/*/, '').split('?', 2);
            var self = this;
            if (window.useAuthentication & !window.isAuthenticated) {
                return this.navigate('#login/' + actions, {trigger:true, replace:true});
            }

            var paths = parts[0].split('/');
            var obj = {params:params};
            if (parts.length > 1) {
                obj = query.parse(parts[1]);
            }
            this.activeHeader(paths[0]);
            var path = paths[0] == 'views' ? [] : ['views'];
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

            var routeStripper = /^[#\/]/;
            Backbone.History.prototype.getFragment = function (fragment, forcePushState) {
                if (fragment == null) {
                    if (this._hasPushState || forcePushState) {
                        fragment = window.location.pathname;
                        var search = window.location.search;
                        if (search) fragment += search;
                    } else {
                        fragment = this.getHash();
                    }
                }
                if (!fragment.indexOf(this.options.root)) fragment = fragment.substr(this.options.root.length);
                var idx = fragment.indexOf('?');
                if (idx > -1) {
                    var path = fragment.substring(0, idx);
                    var obj = query.parse(fragment.substring(idx + 1));
                    var nobj = {};
                    _.each(obj, function (v, k) {
                        if (k[0] != '_')
                            nobj[k] = v;

                    });
                    fragment = path + '?' + query.stringify(nobj);
                }
                return fragment.replace(routeStripper, '');
            };
            var app_router = new AppRouter;
            Backbone.history.start();
        }
    };

});
