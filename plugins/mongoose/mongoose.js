var Plugin = require('../../lib/plugin-api'), util = require('../../lib/util'), _u = require('underscore'), sutil = require('util'), MModel = require('./mmodel');

var MongoosePlugin = function (options) {
    Plugin.apply(this, arguments);
    this.pluginUrl = this.baseUrl;
}
sutil.inherits(MongoosePlugin, Plugin);
module.exports = MongoosePlugin;

MongoosePlugin.prototype.routes = MongoosePlugin.prototype.filters = function () {
};
// the Mongoose plugin is responsible for first adding the modelpaths object to the global AppModel during plugin-manager
// initialization
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
    var tmpP = schema && schema.path && (schema.path(path) || schema.virtuals[path] );
    if (tmpP)
        p = tmpP
    var defaults = {};
    var opts = p.options || {};
    var apiPath = this.options.apiUri || this.baseUrl + 'rest/';
    //  var pathShema = schema.path(path);
//    if (opts.display && (opts.display.display == 'none' || opts.display.hidden) || ( path[0] == '_' && path != '_id')) {
//        return null;
//    }


    if (!tmpP && Model) {
        var obj = { subSchema:{}, type:'Object'}
        _u(p).each(function (v, k) {
            var ref = schema.path(path + '.' + k);
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
                multiple:false,
                ref:opts.ref
            });
        } else if (path == '_id') {
            _u.extend(defaults, {
                type:'Hidden',
                dataType:'String',
                ref:opts.ref
            });
        }
    } else if (p.ref) {
        _u.extend(defaults, {
            url:apiPath + p.ref + '?transform=labelval',
            dataType:'String',
            type:'MultiEditor',
            multiple:false,
            ref:p.ref
        });
    } else {
        var modelName = util.depth(p, 'caster.options.ref');
        if (modelName) {
            _u.extend(defaults, {
                dataType:'Array',
                url:apiPath + modelName + '?transform=labelval',
                type:'MultiEditor',
                multiple:true,
                ref:modelName
            });
        } else {
            var type = p && (util.depth(p, 'options.type') || p.type);
            if (type instanceof Array) {
                _u.extend(defaults, {
                    type:'List'
                });
                if (type.length) {
                    var o = type[0];
                    defaults.listType = 'Object';
                    if (o && o.paths) {
                        //EmbededDocument. May not actually have a type.
                        var s = defaults.subSchema = {};
                        _u.each(o.paths, function onListType(v, k) {
                            s[k] = this.pluginManager.pluginFor(k, v, o);
                        }, this);
                    } else {
                        if (p.caster && p.caster.instance == 'String')
                            defaults.listType = 'Text';
                        else {
                            if (p.schema && p.schema.paths) {

                                var s = (defaults.subSchema || (defaults.subSchema = {}));
                                //     var s = (ds.subSchema || (ds.subSchema = {}));
                                _u.each(p.schema.paths, function onTypeOptions(v, k) {
                                    s[k] = this.pluginManager.pluginFor(k, v, p);
                                }, this);
                                defaults.type = 'List';
                                defaults.listType = 'Object';
                                defaults.label = p.path;

                            } else {
                                console.debug('dunno what this is', p, path)
                            }
                        }

                    }

                } else {
                    console.debug('type array with no meta info?', type, path, p);
                }
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
                        _u.extend(defaults, {type:'File', dataType:'Buffer'});
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

            } else if (path == 'id') {
                defaults.dataType = 'String';
                defaults.type = 'Hidden';
            } else if (path == '_id') {
                defaults = {};
            } else {
                console.log('No Type for [' + path + '] guessing String', p);
                defaults.dataType = 'String';

            }
        }
    }

    if (p.validators) {
        _u.each(p.validators, function (v, k) {
            _u.each(v, function (vv, kk) {
                if (vv instanceof RegExp) {
                    util.defaultOrSet(defaults, 'validator', []).push({name:'match', configure:{match:'/' + vv + '/'}});
                } else if (vv instanceof String) {
                    util.defaultOrSet(defaults, 'validator', []).push({name:vv});
                }else if (vv && vv.name == '__checkRequired'){
                    util.defaultOrSet(defaults, 'validator', []).push({name:'required'});
                }else if (vv && vv.name){
                    util.defaultOrSet(defaults, 'validator', []).push({name:vv.name});

                }

                else {
                    console.warn('can only handle client side regex/required validators for now', vv, kk)
                }
            });
        });
    }


    var ret = _u.extend({type:'Text'}, defaults, opts.display);
    return ret;
}




