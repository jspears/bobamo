var Plugin = require('../../lib/plugin-api'), util = require('../../lib/util'), _u = require('underscore'), sutil = require('util');

var BobamoPlugin = function (options) {
    Plugin.apply(this, arguments);
    this.pluginUrl = this.baseUrl;
}
sutil.inherits(BobamoPlugin, Plugin);
module.exports = BobamoPlugin;
BobamoPlugin.prototype.app = function(){
    var self = this;
    var mongoose = this.options.mongoose;
    return new function () {
        this.__defineGetter__('modelPaths', function () {
            var ret = {};
            _u.each(mongoose.models, function (v, k) {
                ret[v.modelName] = new MModel(v, self);
            }, this);
            return ret;
        });
    }
}

BobamoPlugin.prototype.routes = function () {
    var apiPath = this.options.apiUri || this.pluginUrl + '/rest/';
    var app = this.app;
    var base = this.pluginUrl;
    app.get(base+'/*', function(req,res,next){
        var useAuth = req.isAuthenticated ? true : false;
        res.local('useAuthentication', useAuth )
        res.local('isAuthenticated', useAuth && req.isAuthenicated() : null);
        res.local('api', apiPath);
        res.local('baseUrl', this.baseUrl);
        res.local('params', req.params);
        res.local('query', req.query);
        next();
    });
    app.get(base + '/:view', function (req, res, next) {
        this.generate(res, 'views/'+req.params.view, makeOptions(req));
    });
    app.get(base + '/js/:view', function (req, res, next) {
        this.generate(res, 'views/'+req.params.view, makeOptions(req));
    });
    app.get(base + '/js/:super?/views/:view', function (req, res, next) {
        this.generate(res, 'views/'+req.params.view, makeOptions(req));
    });
    app.get(base + '/js/:super?/views/:type/:view', function (req, res, next) {
        this.generate(res, 'views/'+req.params.view, makeOptions(req));
    });

    app.get(base + '/js/:super?/:clazz/:type', function (req, res, next) {
        this.generate(res, 'views/'+req.params.view, makeOptions(req));
    });

    app.get(base + '/js/:super?/:view', function (req, res, next) {
        this.generate(res, 'views/'+req.params.view, makeOptions(req));

    });
    app.get(base + '/templates/:super?/:type/:view', function (req, res, next) {
        this.generate(res, 'views/'+req.params.view, makeOptions(req));

    });
    app.get(base + '/tpl/:super?/:view', function (req, res, next) {
        this.generate(res, 'views/templates/'+req.params.view, makeOptions(req));

    });
}
BobamoPlugin.prototype.editorFor = function (path, p, Model) {
    var defaults = {};
    var opts = p.options || {};
    var apiPath = this.options.apiUri || this.pluginUrl + '/rest/';
    if (opts.display && opts.display.display == 'none' || ( path[0] == '_' && path != '_id')) {
        return null;
    }
    if (p.instance == 'ObjectID') {
        if (opts.ref) {

            _u.extend(defaults, {
                url:apiPath + opts.ref + '?transform=labelval',
                dataType:'String',
                type:'Select',
                mode:'single'
            });
        } else if (path == '_id') {
            _u.extend(defaults, {
                type:'Hidden',
                dataType:'String'
            });
        }
    } else if (p.ref) {
        _u.extend(defaults, {
            url:apiPath + p.ref + '?transform=labelval',
            dataType:'String',
            type:'Select',
            mode:'single'
        });
    } else {
        var modelName = util.depth(p, 'caster.options.ref');
        if (modelName) {
            _u.extend(defaults, {
                dataType:'Array',
                url:apiPath + modelName + '?transform=labelval',
                type:'MultiEditor'
            });
        } else {
            var type = util.depth(p, 'options.type');

            if (type) {

                switch (type) {
                    case Array:
                        console.log('type is array?', type);
                        break;
                    case
                    Number:
                        _u.extend(defaults, {dataType:'Number'});
                        break;
                    case
                    String:
                        var o = {dataType:'String'};
                        if (p.enumValues && p.enumValues.length) {
                            o.options = p.enumValues;
                            o.type = 'Select';
                        }
                        _u.extend(defaults, o);
                        break;
                    case
                    Buffer:
                        _u.extend(defaults, {type:'File'});
                        break;
                    case
                    Boolean:
                        _u.extend(defaults, {
                            dataType:'Boolean',
                            type:'Checkbox'
                        });
                        break;
                    case
                    Date:
                        _u.extend(defaults, {
                            type:'DateTime',
                            dataType:'Date'

                        })
                        break;
                    default:
                    {
                        console.error('unknown type for [' + path + ']', p);
                    }
                }

            } else {
                console.log('No Type for [' + path + '] guessing String', p);
                defaults.dataType = 'String';
            }
        }
    }
    if (opts.required) {
        util.defaultOrSet(defaults, 'validator', []).push('required');
//        (defaults.validator ? defaults.validator : (defaults.validator = [])).push('required');
    }
    if (p.validators) {
        _u.each(p.validators, function (v, k) {
            if (v.length) {
                if (v[0] instanceof RegExp) {
                    util.defaultOrSet(defaults, 'validator', []).push('/' + v[0] + '/');
                } else {
                    console.warn('can only handle client side regex/required validators for now')
                }
            }
        })
    }
    return _u.extend({}, defaults, opts.display);
}