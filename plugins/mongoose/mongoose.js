var  Plugin = require('../../lib/plugin-api'), util = require('../../lib/util'), _u = require('underscore'), sutil = require('util'), MModel = require('./mongoose-model');

var valid = {};
var validFuncs =  {};

var MongoosePlugin = function (options) {
    Plugin.apply(this, arguments);
    this.pluginUrl = this.baseUrl;

}
sutil.inherits(MongoosePlugin, Plugin);
module.exports = MongoosePlugin;

var validFuncs = {};
MongoosePlugin.prototype.appModel = function (options) {
//    this.pluginManager.requirejs(['mongoose/validators'], function(validators){
//
//        validators.inject(validFuncs)
//    })
    valid = this.pluginManager.requirejs('mongoose/validators');

    var self = this;
    var mongoose = this.options.mongoose;
    return new function () {
        this.__defineGetter__('modelPaths', function () {
            var ret = {};
            _u.each(mongoose.models, function (v, k) {
                //This tells us that it was externally configured. If this is the
                // case all the configuration will come from there. Otherwise it goes
                // this should be fixed someday.   Not entirely sure how.
                if (v._configured){
                  //  ret[v.modelName] = new MModel(v, self.pluginManager)
                    return; //skip configured to prevent a nasty loop.
                }
                ret[v.modelName] = new MModel(v, self.pluginManager);
            }, this);
            return ret;
        });
    }
}
function naturalType(mongoose, type) {
    switch (type) {
        case 'String':
            return String;
        case 'Date':
            return Date;
        case 'Number':
            return Number;
        case 'Boolean':
            return Boolean;
        case 'ObjectId':
            return mongoose.Schema.Types.ObjectId;
        case 'Array':
            return Array;
        default:
        {
            return mongoose.Schema.Types[type];
        }
    }
}
var TypeAllow = {
    'String':['min', 'max', 'trim', 'uppercase', 'lowercase'],
    'Number':['min', 'max']
}
MongoosePlugin.prototype.modelFor = function(m){
    return this.options.mongoose.models[m];
}
MongoosePlugin.prototype.schemaFor = function (schema) {
    schema = schema.schema || schema;
    var nSchema = {};
    var pm = this.pluginManager;
    var mongoose = this.options.mongoose;
    var validatorPaths = {};
    function onPath(model, obj, sp) {
        _u.each(model, function (v, k) {
            var path = {};
            if (v.name == '_id' || v.name == 'id')
                return;
            obj[v.name] = v.multiple ? [path] : path;
            if (v.ref) path.ref = v.ref;
            if (v.schemaType == 'Object'){
                return onPath(v.subSchema, (path[v.name] = {}), sp ? v.name : [sp, v.name].join('.'))
            }
            path.type = naturalType(mongoose, v.schemaType || 'String');
            _u.each(['unique', 'index', 'expires', 'select'], function (vv, k) {
                if (_u.isUndefined(v[vv]) || v[vv] == null)
                    return;
                path[vv] = v[vv];
            });
            if (v.schemaType == 'String') {
                if (~['uppercase', 'lowercase'].indexOf(v.textCase)) {
                    path[v.textCase] = true;
                }
            }

            if (v.validators) {
                var validate = (path.validate = []);

                _u.each(v.validators, function (vv,kk){
                    validate.push(pm.validator(vv.type || vv.name, vv));

                });
//                path.validate = function onMongooseValidate(){
//                    var args = _.toArray(arguments);
//                    args.push(this);
//                    var ret = _u.chain(v.validators).map(function (v, kk) {
//                        var ctx  =  pm.validator(v.type || v.name, v)
//                        var validator = ctx.validator;
//                        var validated = validator.apply(ctx, args);
//                        return validated;
//                    }).filter(function(r){
//                           return !!r;
//                        }).value();
//
//                    return ret.length == 0;
//                }
            }

        });
    }

    onPath(schema, nSchema);
    return new this.options.mongoose.Schema(nSchema);
}
MongoosePlugin.prototype.updateSchema = function (modelName, schema, callback) {
    var model;
   try {
       model = this.options.mongoose.model(modelName);

   }catch(e){

       var mschema = this.schemaFor(schema);
       model = this.options.mongoose.model(modelName, mschema);
   }

    console.log('loading schema', modelName);
    if (callback)
        callback(model);
    return true;
}
function onValid(v,k){
    return _u.extend({type:k}, v);
}
MongoosePlugin.prototype.validators = function (type) {
    var validall =  _u.map(valid.validators, onValid);

    if (type){
        return _u.filter(validall, function(v,k){
            return !v.types ? true : v.types && ~v.types.indexOf(type);
        });
    }
    return validall;
}
//MongoosePlugin.prototype.validator = function (v, options) {
//  var validators = validFuncs.validators;
//   return validators && (validators[v.type] || validators[v.name]  || validators[v]).call(validators, options);
//}

MongoosePlugin.prototype.editorFor = function (path, p, Model) {
    var schema = Model.schema || Model;
    var tmpP = schema && schema.path && (schema.path(path) || schema.virtuals[path] );
    if (tmpP)
        p = tmpP
    var defaults = {};
    var opts = p.options || {};
    var mongoose = this.options.mongoose;
    var apiPath = this.options.apiUri || this.baseUrl + 'rest/';
    //  var pathShema = schema.path(path);
    if (( path[0] == '_' && path != '_id')) {

        return null;
    }
    if (opts.display && opts.display.display == 'none')
        defaults.hidden = true;

    if (!tmpP && Model) {
        var obj = { subSchema:{}, type:'Object'}
        //I really am not sure about p[path]   but it makes a bug if I don't.
        _u(p[path]).each(function (v, k) {
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
                schemaType:'String',
                type:'MultiEditor',
                multiple:false,
                ref:opts.ref
            }, opts.display);
        } else if (path == '_id') {
            _u.extend(defaults, {
                type:'Hidden',
                schemaType:'String'
            });
        }
    } else if (p.ref) {
        _u.extend(defaults, {
            url:apiPath + p.ref + '?transform=labelval',
            schemaType:'String',
            type:'MultiEditor',
            multiple:false
        });
    } else {
        var modelName = util.depth(p, 'caster.options.ref');
        if (modelName) {
            _u.extend(defaults, {
                schemaType:'Array',
                url:apiPath + modelName + '?transform=labelval',
                type:'MultiEditor',
                multiple:true,
                ref:modelName
            });
        } else {
            var type = p && (util.depth(p, 'options.type') || p.type);
            type = _u.isString(type) ? naturalType(mongoose, type) :type;
            if (type instanceof Array) {
                _u.extend(defaults, {
                    type:'List'
                });
                if (type.length) {
                    var o = type[0];
                    defaults.listType = 'Object';
                    if (o && o.schema) {
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
                        _u.extend(defaults, {schemaType:'Number', type:'Number'});
                        break;
                    case
                    String:
                        var o = {schemaType:'String'};
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
                            schemaType:'Boolean',
                            type:'Checkbox'
                        });
                        break;
                    case
                    Date:
                        _u.extend(defaults, {
                            type:'DateTime',
                            schemaType:'Date',
                            dataType:'date'

                        })
                        break;
                    default:
                    {
                        var type = this.pluginManager.pluginFor(path,  p, schema);
                        if (type == null)
                          console.error('unknown type for [' + path + ']', p);

                        else{
                            console.log('found type', type);
                            _u.extend(defaults, type);
                        }
                        break;
                    }
                }

            } else {
                if (path != 'id')
                    console.log('No Type for [' + path + '] guessing String', p);
                defaults.schemaType = 'String';
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
                    util.defaultOrSet(defaults, 'validators', []).push({ type:'regexp', regexp:v[0] + '', message:v[1] });
                } else if (v[1] == 'required') {
                    util.defaultOrSet(defaults, 'validators', []).push({ type:'required', message:v[1] });

                } else if (p.instance == 'Number' || _u.isNumber(p.options.min)) {
                    if (v[1] == 'min') {
                       util.defaultOrSet(defaults, 'validators', []).push({ type:'min', message:v[1], configure:{min:p.options.max} });

                    } else if (v[1] == 'max' || _u.isNumber(p.options.max)) {
                       util.defaultOrSet(defaults, 'validators', []).push({ type:'max', message:v[1], configure:{min:p.options.min}  });
                    }
                }else if(v[0].type){
                    console.log('validator type', v[0].type, v[0]);
                    util.defaultOrSet(defaults, 'validators', []).push( v[0] );

                }else{
                    console.warn('can only handle client side regex/required/min/max validators for now', v)
                }
            }
        })
    }
    if (p.instance == 'String' && p.options){
        if ( _u.isNumber(p.options.min)) {
            util.defaultOrSet(defaults, 'validators', []).push({ type:'minlength', configure:{minlength:p.options.min} });
        }
        if (_u.isNumber(p.options.max)) {
            util.defaultOrSet(defaults, 'validators', []).push({ type:'maxlength', configure:{maxlength:p.options.max} });
        }
    }
    var ret = _u.extend({type:'Text'}, defaults, opts.display);
    return ret;

}



