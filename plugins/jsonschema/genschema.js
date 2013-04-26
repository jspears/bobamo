var bobamo = require('../../index'),
    _u = require('underscore'),
    inflection = bobamo.inflection,
    Spec = require('./Spec'),
    su = require('./swag-utils')
    ;
var swagger = require("./lib/swagger");
var util = require('../../lib/util');
var param = require("./lib/paramTypes");
var url = require("url");
var swe = swagger.errors;
var Model = bobamo.DisplayModel;

"use strict";
//byte boolean int long float double string Date void'



module.exports = {
    modelToSchema:function doModelToSchema(m, models, hasIdCallback) {
        if (!models) models = {};
        var noId = true;//hasIdCallback && hasIdCallback(m); // !(pluginManager.appModel.modelPaths[m.modelName || m]);
        var model = m.schema;
        var description = m.description || m.help || m.title;
        var transactional = m.transactional === false  ? false :  true;
        var jsonSchema = {
            //    "id":"http://some.site.somewhere/entry-schema#",
            "$schema":"http://json-schema.org/draft-04/schema#",
            type:"object",
            id:m.modelName,
            required:[],
            description:description,
            properties:transactional ? (function () {
                return _u.extend({
                    _v:{
                        type:'number',
                        description:'Version identifier for current record, needed for optimistic locking'
                    }

                }, noId ? {} : {
                    _id:{
                        type:'string',
                        description:'Identifier for "' + m.modelName + '"'
                    }
                });
            })() :{}
        };
        var walkJson = function (schema, properties, required) {
            _u.each(schema, function eachWalkJson(v, ok) {
                var k = ok.split('.').pop();
                if (!v) {
                    console.log('walkSchema v is null for', k);
                    return true;
                }
                var subJson = properties[k] || (properties[k] = {});
                var type = su.fromType(v.schemaType, v.type);
                subJson.description = v.description || v.help || v.title;
                var lType = type && type.toLowerCase();
                var multiple = v.multiple || lType == 'array' || lType == 'list' || lType == 'set';
                if (multiple)
                    subJson.type = 'array';

                var ref = v.modelName || v.ref;

                if (v.subSchema) {
                    if (!ref && multiple) ref = inflection.classJoin([m.modelName].concat(k.split('.')).join(' '));
                    if (ref) {
                        if (!models[ref]) {
                            var sm = new Model(ref, [v]);
                            models[ref] = this.modelToSchema(sm, models, hasIdCallback);
                        }
                        if (multiple) {
                            subJson.items = {
                                "$ref":ref
                            }
                        } else {
                            subJson.type = ref;
                        }
                    } else {
                        if (multiple) {
                            subJson.items = {type:'string'}
                        } else {
                            subJson.type = "object"
                            subJson.properties = {};
                            walkJson(v.subSchema, subJson.properties, (subJson.required = []));
                        }
                    }
                }

                _u.each(v.validators, function (vv, kk) {
                    if (vv.type == 'required') {
                        //subJson.required = true;
                        if (!~required.indexOf(k))
                            required.push(k);
                    }
                    else if (vv.type == 'enum') {
                        subJson.enum = vv.enums;
                        subJson.type = 'string'
                    } else if (vv.type == "regexp") {
                        subJson.type = 'string';
                        subJson.pattern = vv.regexp;
                    } else if (vv.type == 'min') {
                        subJson.type = type;
                        subJson.minimum = vv.min;
                    } else if (vv.type == 'max') {
                        subJson.type = type;
                        subJson.maximum = vv.max;
                    } else if (vv.type == 'minLength') {
                        subJson.type = type;
                        subJson.minLength = vv.minLength;
                    } else if (vv.type == 'maxLength') {
                        subJson.type = type;
                        subJson.maxLength = vv.maxLength;
                    } else if (vv.type == 'minItems') {
                        subJson.minItems = vv.minItems;
                    } else if (vv.type == 'maxItems') {
                        subJson.maxItems = vv.maxItems;
                    }
                });
                if (v.unique) {
                    subJson.uniqueItems = true;
                }
                if (v.type == 'Select' && v.options) {
                    subJson.enum = v.options.map(function (v) {
                        return v && v.val || v;
                    });
                    //todo look at this for sanity.
                    subJson.type = 'string'
                }
                if (!subJson.type)
                    subJson.type = type;

                if (!subJson.type)
                    console.log('No type for ', [m.modelName].concat(k).join('.'), JSON.stringify(v, null, 3));

            }, this);
        }.bind(this)

        walkJson(m.schema, jsonSchema.properties, jsonSchema.required);

        return jsonSchema;
    },
    update:function (v, k) {
        var summary = (v.methods && v.methods.update && v.methods.update.summary || '');
        var K = inflection.capitalize(k);
        return {
//                "path":"/" + k,            "parameters":[param.path("id", "ID of " + v.modelName, "string")],


            "notes":"Updates a " + K + " in the store",
            "httpMethod":"PUT",
            "summary":"Update an existing " + v.title.toLowerCase() +(summary || ''),
            "parameters":[param.path("id", "ID of " + v.modelName, "string"), param.post(k, v.title + " object that needs to be added to the store")],
            "errorResponses":[swe.invalid('id'), swe.notFound(k), swe.invalid('input')],
            "allowMultiple":false,
            "paramType":"body",
            responseClass:"void",
            "nickname":"update"
        }
    },
    create:function (v, k) {
        var summary = (v.methods && v.methods.create && v.methods.create.summary || '');

        var K = inflection.capitalize(k);
        return {
            "notes":"adds a " + K + " to the store",
            "summary":"Add a new " + K + " to the store "+(summary || ''),
            "httpMethod":"POST",
            "parameters":[param.post(k, v.title + " object that needs to be added to the store")],
            "errorResponses":[swe.invalid('input')],
            "nickname":"add",
            "dataType":k,
            "allowMultiple":false,
            "paramType":"body",
            responseClass:"void"
        }
    },
    action:function (req, res, next) {
        var newUrl = '/rest' + req.url;

        req.url = newUrl;
        next();
    },
    finders:function (v, k) {
        if (!v.finders)
            return;
        var allowed = v.allowedMethods || v.finders.map( function(v){ return v.name });
        return _u.map(v.finders, function onMapFinders(vv, kk) {
            if (!vv.spec)
                return;
            if (!~allowed.indexOf(vv.name)){
                console.log('method not allowed', vv.name);
                return;
            }

            var type = vv.spec && vv.spec.method && vv.spec.method.toUpperCase() || 'GET';
            var responseClass = vv.spec.responseClass || 'List[' + k + ']'
            var ret = _u.extend({
                    path:vv.name,
                    parameters:vv.spec.params,
                    httpMethod:type,
                    responseClass:responseClass,
                    responseModel:vv.spec.responseModel(),
                    summary:vv.summary || vv.spec.summary
                },
                _u.omit(vv.spec, 'method', 'params', 'path', 'responseModel'))
            return ret;
        }, this)

    },
    find:function (v, k) {
        var summary = (v.methods && v.methods.find && v.methods.find.summary || '');
        return  {
            "description":"Returning all " + v.plural,
            "notes":"All values with typical sorting/filtering",
            "summary":"Find all " + v.plural+(v.find && v.find.find || '')+ (summary || ''),
            "httpMethod":"GET",
            "parameters":su.params(v),
            "responseClass":"List[" + k + "]",
            "errorResponses":[],
            "nickname":"find"
        }

    },
    findById:function (v, k) {
        var summary = (v.methods && v.methods.findById && v.methods.findById.summary || '');
        var K = inflection.capitalize(k);
        return  {
            //   "path":"/{id}",
            "notes":"Updates a " + v.title + " in the store",
            "httpMethod":"GET",
            "summary":"Return an existing " + v.title+ (summary),
            "parameters":[param.path("id", "ID of " + v.modelName, "string")],
            "errorResponses":[swe.invalid('id'), swe.notFound(v.modelName)],
            "nickname":"findById",
            "responseClass":k
        }
    },
    remove:function (v, k) {
        var K = inflection.capitalize(k);
        var summary = (v.methods && v.methods.remove && v.methods.remove.summary || '');
        return {
            //"path":"/" + k + "/{id}",
            "notes":"Removes a " + v.modelName + " from the store",
            "httpMethod":"DELETE",
            "summary":"Remove an existing " + v.modelName+ (summary | ''),
            "parameters":[param.path("id", "ID of " + v.modelName + " that needs to be removed", "string")],
            "errorResponses":[swe.invalid('id'), swe.notFound(v.modelName)],
            "nickname":"remove",
            "responseClass":"void"
        };
    }
}