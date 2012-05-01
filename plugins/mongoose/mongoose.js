var Plugin = require('../../lib/plugin-api'), util = require('../../lib/util'), _u = require('underscore'), sutil = require('util'), MModel = require('./mmodel');

var MongoosePlugin = function (options) {
    Plugin.apply(this, arguments);
    this.pluginUrl = this.baseUrl;
}
sutil.inherits(MongoosePlugin, Plugin);
module.exports = MongoosePlugin;

MongoosePlugin.prototype.routes = MongoosePlugin.prototype.filters = function () {
};
MongoosePlugin.prototype.appModel = function (options) {
    var self = this;
    var mongoose = this.options.mongoose;
    return new function () {
        this.__defineGetter__('modelPaths', function () {
            var ret = {};
            _u.each(mongoose.models, function (v, k) {
                ret[v.modelName] = new MModel(v, self.pluginManager);
            }, this);
            return ret;
        });
    }
}

MongoosePlugin.prototype.editorFor = function (path, p, Model) {
    var schema = Model.schema || Model;
    var tmpP = schema && (schema.paths[path] || schema.virtuals[path] );
    if (tmpP)
        p = tmpP
    var defaults = {};
    var opts = p.options || {};
    var apiPath = this.options.apiUri || this.baseUrl + 'rest/';
    if (opts.display && opts.display.display == 'none' || ( path[0] == '_' && path != '_id')) {
        return null;
    }

    if (!tmpP && Model) {
        var obj = { subSchema:{}, type:'Object'}
        _u(p).each(function (v, k) {
            var ref = schema && schema[path + '.' + k];
            var editor = this.pluginManager.pluginFor(path + '.' + k, ref || v, Model);
            if (editor)
                obj.subSchema[k] = editor;
        }, this);
        return obj;
    }
    if (p.instance == 'ObjectID') {
        if (opts.ref) {

            _u.extend(defaults, {
                url:apiPath + opts.ref + '?transform=labelval',
                dataType:'String',
                type:'MultiEditor',
                multiple:false
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
            type:'MultiEditor',
            multiple:false
        });
    } else {
        var modelName = util.depth(p, 'caster.options.ref');
        if (modelName) {
            _u.extend(defaults, {
                dataType:'Array',
                url:apiPath + modelName + '?transform=labelval',
                type:'MultiEditor',
                multiple:true
            });
        } else {
            var type = p && (util.depth(p, 'options.type') || p.type);
            if (type instanceof Array) {
                console.log('it is an array');
                _u.extend(defaults, {
                    type:'List'
                });
                if (type.length) {
                    var o = type[0];
                    defaults.listType = 'Object';
                    var s = defaults.subSchema = {};
                    if (o && o.paths)
                        _u.each(o.paths, function onListType(v, k) {
                            s[k] = this.pluginManager.pluginFor(k, v, o);
                        }, this);

                }
                console.log('defaults', defaults);
            } else if (type) {

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
                            o.type = 'MultiEditor';
                            o.multiple = false;
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
    var ret = _u.extend({type:'Text'}, defaults, opts.display);
    return ret;

}



