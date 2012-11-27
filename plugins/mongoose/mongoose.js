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
MongoosePlugin.prototype.updateSchema = function (modelName, schema, callback) {
    var paths = schema.paths;
    delete schema.paths;
    var nSchema = {};
    var pm = this.pluginManager;
    var mongoose = this.options.mongoose;

    function onPath(model) {
        return function (v, k) {
            var path = {};
            if (v.name == '_id' || v.name == 'id')
                return;
            model[v.name] = v.multiple ? [path] : path;
            if (v.ref) path.ref = v.ref;
            if (v.dataType != 'Object')
                path.type = mongoose.SchemaTypes[v.dataType];

            if (v.validators) {
                var valid = (path.validate = []);
                _u.each(v.validators, function (vv, kk) {
                    valid.push([pm.validator(vv).validator, vv.message]);
                })
            }
            if (v.min)
                path.min = v.min;
            if (v.max)
                path.max = v.max;
            if (v.default)
                path.default = v.default;
            if (v.subSchema) {
                _u.each(v.subSchema, onPath(path));
            }
            //if ()
        }
    }

    _u.each(paths, onPath(nSchema));

    console.log('updating', modelName, nSchema);
    if (callback)
        callback();
}
MongoosePlugin.prototype.validators = function (type) {
    return [
        {
           type:'Required'
        },
        {
            types:['String'],
            type:'RegExp'
        },
        {
            types:['Number'],
            type:'min'
        },
        {
            types:['Number'],
            type:'max'
        }


    ]
}
MongoosePlugin.prototype.validator = function (v) {
    if ((v.name || v) == 'match') {
        var re = new RegExp(v.configure.match);
        return {
            name:'match',
            validate:function (vv) {

                return re.test(vv);
            },
            message:v.message
        }
    } else if ((v.name || v) == 'required') {
        return {
            name:'required',
            validate:function (vv) {

            },
            message:v.message
        }
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
    if (opts.display && opts.display.display == 'none' || ( path[0] == '_' && path != '_id')) {
        return null;
    }


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
                multiple:true,
                ref:modelName
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
                    if (o && o.paths) {
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

                            }
                        }

                    }

                }
            } else if (type) {

                switch (type) {
                    case Array:
                        console.log('type is array?', type);
                        break;
                    case
                    Number:
                        _u.extend(defaults, {dataType:'Number', type:'Number'});
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
                if (path != 'id')
                    console.log('No Type for [' + path + '] guessing String', p);
                defaults.dataType = 'String';
            }
        }
    }
    if (opts.required) {
        util.defaultOrSet(defaults, 'validators', []).push({type:'required'});
//        (defaults.validator ? defaults.validator : (defaults.validator = [])).push('required');
    }
    if (p.validators) {
        _u.each(p.validators, function (v, k) {
            if (v.length) {
                if (v[0] instanceof RegExp) {
                    util.defaultOrSet(defaults, 'validators', []).push({ type:'regexp',regexp: v[0]+'', message:v[1] });
                } else {
                    console.warn('can only handle client side regex/required validators for now', v, k)
                }
            }
        })
    }
    var ret = _u.extend({type:'Text'}, defaults, opts.display);
    return ret;

}



