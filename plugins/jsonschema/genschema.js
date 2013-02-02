var bobamo = require('../../index'),
    _u = require('underscore'),
    inflection = bobamo.inflection
    ;
var swagger = require("swagger-node-express/Common/node/swagger");
var util = require('../../lib/util');
var param = require("swagger-node-express/Common/node/paramTypes");
var url = require("url");
var swe = swagger.errors;
var Model = bobamo.DisplayModel;
"use strict";
//byte boolean int long float double string Date void'
function fromType(type, obj) {
    for (var i = 0, l = arguments.length; i < l; i++) {
        var t = arguments[i];
        if (!t)
            continue;
        t = t.toLowerCase();

        if (t == 'string' || t == 'boolean' || t == 'int' || t == 'double' || t == 'Date' || t == 'void')
            return t;

        if (t == 'number')
            return 'number'

        if (t == 'text' || t == 'textarea')
            return 'string'

        if (t == 'datetime' || t == 'date')
            return 'Date'


        if (t == 'integer' || t == 'int')
            return 'int';

        if ( t == 'list' || t == 'array')
            return 'array';

        if (t == 'object' || t == 'objectid')
            return 'object'

        }
    return null;
}


//var defSpec = {
//    "description":"Operations about pets",
//    "path":"/pet.{format}/{petId}",
//    "notes":"Returns a pet based on ID",
//    "summary":"Find pet by ID",
//    "method":"GET",
//    "params":[param.path("petId", "ID of pet that needs to be fetched", "string")],
//    "responseClass":"Pet",
//    "errorResponses":[swe.invalid('id'), swe.notFound('pet')],
//    "nickname":"getPetById"
//};
//args == specs;
/**
 * Takes a schema calls function on each path.
 * @param schema
 * @param func
 * @param path
 */
function walkSchema(schema, func, path) {
    path = path || [];
    _u.each(schema, function (v, k) {
        var p = path.concat(k);
        if (func(v, k, p) === true)
            return;
        if (v.subSchema)
            walkSchema(v.subSchema, func, p);
    });
}

function fix(arr, str) {
    if (!arr.length) return [];
    var ret = [];
    for (var i = 0, l = arr.length; i < l; i++) {
        ret.push(str);
        ret.push(arr[i]);
    }

    return ret;

}
module.exports = {
    modelToSchema:function doModelToSchema(m, depends, pluginManager, models, hasIdCallback) {
        if (!models) models = {};
        var noId = true;//hasIdCallback && hasIdCallback(m); // !(pluginManager.appModel.modelPaths[m.modelName || m]);
//        depends = depends || [];

//        if (_u.isString(m))
//            m = pluginManager.modelFor(m);
        var model = m.schemaFor();
        var description = m.description || m.help || m.title;
        var jsonSchema = {
        //    "id":"http://some.site.somewhere/entry-schema#",
            "$schema":"http://json-schema.org/draft-04/schema#",
            type:"object",
            id:m.modelName,
            required:[],
            description:description,
            properties:(function(){
                return noId ? {} : {
                        _id:{
                            type:'string',
                            description:'Identifier for "' + m.modelName + '"'
                        }
                    }
                })()
            };
        var depth = jsonSchema;
        walkSchema(model, function (v, k, path) {
            if (v == null ){
                console.log('walkSchema', k, path);
                return true;
            }
            var ret;
            var properties = fix(path, 'properties').join('.');
            var subJson = {};

            var type = fromType(v.schemaType, v.type);
            subJson.description = v.description || v.help || v.title;
            var multiple = v.multiple || type == 'array' || type == 'list' || type == 'set';
            var ref = v.modelName || v.ref;

            if (v.subSchema){
                if (!ref && multiple ) ref = inflection.classJoin([m.modelName].concat(path).join(' '));

                if (ref && !models[ref])
                    models[ref] = false;

                if (ref && !models[ref]){
                    var subModel = _u.extend({schema:v.subSchema}, _u.omit(v, 'subSchema'));
                    models[ref] = this.modelToSchema(new Model(ref, [subModel]), depends, pluginManager, models, hasIdCallback);
                   return true;
                }
            }

            _u.each(v.validators, function (vv, kk) {
                if (vv.type == 'required') {
                    //subJson.required = true;
                    if (path.length == 1) {
                        if (!~jsonSchema.required.indexOf(k))
                            jsonSchema.required.push(k);
                    } else {
                        var pt = util.depth(jsonSchema, fix(path.slice(0, path.length - 1), 'properties'), {});
                        var arr = pt.required || (pt.required = []);
                        if (!~arr.indexOf(k))
                            arr.push(k);
                    }
                }
                else if (vv.type == 'enum') {
                    subJson.enum = vv.enums;
                } else if (vv.type == "regexp") {
                    subJson.type = type;
                    subJson.pattern = vv.regexp;
                } else if (vv.type == 'min') {
                    subJson.type = type;
                    subJson.minimum = vv.min;
                } else if (vv.type == 'max') {
                    subJson.type = type;
                    subJson.maximum = vv.max;
                } else if (vv.type == 'minLength'){
                    subJson.type = type;
                    subJson.minLength = vv.minLength;
                } else if (vv.type == 'maxLength'){
                    subJson.type = type;
                    subJson.maxLength = vv.maxLength;
                } else if (vv.type == 'minItems'){
                    subJson.type = 'array';
                    subJson.minItems = vv.minItems;
                } else if (vv.type == 'maxItems'){
                    subJson.type = 'array';
                    subJson.maxItems = vv.maxItems;
                }
            });
            if (v.unique){
                subJson.uniqueItems = true;
            }
            if (v.type == 'Select' && v.options){
                subJson.type = 'String'
                subJson.enum = v.options.map(function(v){
                    return v && v.val || v;
                });
            }
            if (multiple) {
                var items = subJson.items = {}
                if (ref) items.$ref = ref;
                else
                    items.type = 'string';
                subJson.type = 'array';
             //   ret = true;
            }else if (type || ref) {
                subJson.type = type || ref;
            }else {
                subJson.properties = {};
                depth = subJson.properties;
                return true;
            }
            if (!subJson.type)
                console.log('No type for ',[m.modelName].concat(path).join('.'), JSON.stringify(v,null,3));

            util.depth(jsonSchema, properties, subJson, true);
            return ret;
        }.bind(this));
        return jsonSchema;
    },
    put:function (v, k) {
        var K = inflection.capitalize(k);
        return {
//                "path":"/" + k,            "parameters":[param.path("id", "ID of " + v.modelName, "string")],


            "notes":"updates a " + K + " in the store",
            "httpMethod":"PUT",
            "summary":"Update an existing " + v.title.toLowerCase(),
            "parameters":[param.path("id", "ID of " + v.modelName, "string"),param.post(k, v.title + " object that needs to be added to the store")],
            "errorResponses":[swe.invalid('id'), swe.notFound(k), swe.invalid('input')],
            "allowMultiple":false,
            "paramType":"body",
            responseClass:"void",
            "nickname":"update" + K
        }
    },
    post:function (v, k) {
        var K = inflection.capitalize(k);
        return {
            "notes":"adds a " + K + " to the store",
            "summary":"Add a new " + K + " to the store",
            "httpMethod":"POST",
            "parameters":[param.post(k, v.title + " object that needs to be added to the store")],
            "errorResponses":[swe.invalid('input')],
            "nickname":"add" + K,
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
    params:function (v) {
        var p = [
            param.q('skip', 'number of records to skip', 'int', false, false, null, 0),
            param.q('limit', 'limit the number of records', 'int', false, false, null, 10)
        ]
        var filters = [], sort = [], populate = [];
        _u.each(v.schema, function (vv, k) {

//            var k = vv.path;
            if (k == 'id')
                return;
            var type = vv.schemaType;
            if (type == 'Date' || type == 'Number' || type == 'String') {
                filters.push(param.q('filter[' + k + ']', 'filter text fields on ' + k+' supports &gt;, &lt;, = modifiers', 'string', false, false));
                sort.push(param.q('sort[' + k + ']', 'sort on ' + k + ' direction ascending 1, descending -1', 'int', false, false, [1, -1], 1));
            } else {
                populate.push(k)
            }

        })
        if (populate.length) {
            p = p.concat(param.q('populate', 'populate field', 'string', false, true, populate))
        }
        return  p.concat(filters, sort);
    },
    finders:function (v, k) {
        return _u.map(v.finders, function (vv, kk) {
            if (!vv.spec)
                return;
            var type = vv.spec && vv.spec.method && vv.spec.method.toLowerCase() || 'get';
            var responseClass = vv.spec.responseClass || 'List[' + k + ']'
            var ret = _u.extend({
                    path:vv.name,
                    parameters:vv.spec.params,
                    httpMethod:type,
                    responseClass:responseClass,
                    responseModel:vv.spec.responseModel()
                },
                _u.omit(vv.spec, 'method', 'params', 'path', 'responseModel'))

            return ret;
        })

    },
    all:function (v, k) {
        return  {
            "description":"Returning all " + v.plural,
            "notes":"All values with typical sorting/filtering",
            "summary":"Find all " + v.plural,
            "httpMethod":"GET",
            "parameters":this.params(v),
            "responseClass":"List[" + k + "]",
            "errorResponses":[],
            "nickname":"findAll" + inflection.capitalize(inflection.camelTo(v.plural))
        }

    },
    one:function (v, k) {

        var K = inflection.capitalize(k);
        return  {
            //   "path":"/{id}",
            "notes":"updates a " + v.title + " in the store",
            "httpMethod":"GET",
            "summary":"Return an exitsting " + v.title,
            "parameters":[param.path("id", "ID of " + v.modelName, "string")],
            "errorResponses":[swe.invalid('id'), swe.notFound(v.modelName)],
            "nickname":"get" + K + "ById",
            "responseClass":k
        }
    },
    del:function (v, k) {
        var K = inflection.capitalize(k);
        return {
            //"path":"/" + k + "/{id}",
            "notes":"removes a " + v.modelName + " from the store",
            "httpMethod":"DELETE",
            "summary":"Remove an existing " + v.modelName,
            "parameters":[param.path("id", "ID of " + v.modelName + " that needs to be removed", "string")],
            "errorResponses":[swe.invalid('id'), swe.notFound(v.modelName)],
            "nickname":"delete" + K,
            "responseClass":"void"
        };
    },
    fromType:fromType
}