var bobamo = require('../../index'), Finder = bobamo.FinderModel,
    _u = require('underscore'),
    inflection = bobamo.inflection
    ;
var swagger = require("swagger-node-express/Common/node/swagger");
var util = require('../../lib/util');
var param = require("swagger-node-express/Common/node/paramTypes");
var url = require("url");
var swe = swagger.errors;
"use strict";

Finder.prototype.__defineGetter__('spec', function () {

    return new Spec([this.display.spec], this)
});

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

var Spec = function (args, finder, path) {
    this.__defineGetter__('errorResponses', function () {
        var errorResponses = util.find(errorResponses, args);
        if (errorResponses && errorResponses.length) {
            return errorResponses;
        } else {
            return [swe.invalid('path')]
        }
    })
    this.__defineGetter__('params', function () {
        var method = this.method || 'GET';
        var parameters = [];
        var v = finder;
        if (v.display && v.display.hidden)
            return;
        if (v.display && v.display.schema) {
            var paramType = method == 'GET' ? 'query' : 'body';
            if (finder.model){
                _u.each(finder.model.schemaFor(), function (vv, kk) {
                    var required = _.first(_.where(v.validators, {type:'required'})) || false;
                    parameters.push({
                        allowMultiple:false,
                        dataType:(!vv.type || vv.type == 'Text') ? "string" : vv.type && vv.type.toLowerCase(),
                        description:vv.help || vv.description,
                        name:kk,
                        paramType:paramType,
                        required:required})
                });
                if (method == 'GET'){
                    parameters = parameters.concat(Swag.params(finder.model.modelName))
                }
            }

        }
        return parameters;
    })


    this.__defineGetter__('description', function () {
        var description = util.find('description', args);
        if (description)
            return description;
        return 'Operations about ' + finder.title;

    });
    this.__defineGetter__('path', function () {
        var path = util.find('path', args);
        if (path)
            return path;
        return '/' + finder.model.modelName + '/' + util.find('name', [finder]);
    });
    this.__defineGetter__('notes', function () {
        return util.find('notes', args) || util.find('title', [finder])
    });

//    ['summary', 'method'].forEach(util.easyget(args), this);

    this.__defineGetter__('responseClass', function () {
        return util.find('responseClass', args) || "List[" + finder.model.modelName + "]";
    });

    this.__defineGetter__('nickname', function () {
        return util.find('nickname', args) || finder.name;

    });
    this.__defineGetter__('method', function () {
        if (finder && finder.display && finder.display.method)
            return finder.display.method;
        return 'GET';

    });
    this.__defineGetter__('summary', function () {
        if (finder && finder.display && finder.display.summary)
            return finder.display.summary;
        return finder.help || finder.description || 'About ' + finder.title;

    });
}
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

function specify(appModel, app) {
    swagger.configureSwaggerPaths('', "/api-docs", "");
    swagger.setAppHandler(app);
    var models = {}, deps = [];
    _u.each(appModel.modelPaths, function (model, v) {
        if (models[v]) //prevent (infinite) recursion
            return;
        //    var model = appModel.modelFor(v);
        (models[v] = this.modelToSchema(model, deps)).id = v;

    }, this);
    var sw = swagger.addModels({models:models});
    _u.each(appModel.modelPaths, function (v, k) {
        sw.addGet(this.all(v, k))
            .addGet(this.one(v, k))
            .addPost(this.post(v, k))
            .addPut(this.put(v, k))
            .addDelete(this.del(v, k))
        ;

        var action = this.action;
        _u.each(v.finders, function (vv) {
            if (!vv.spec)
                return;
            var type = vv.spec && vv.spec.method && vv.spec.method.toLowerCase() || 'get';
            var spec = { spec:vv.spec, action:action}
            switch (type) {
                case 'get':
                    sw.addGet(spec);
                    break;
                case 'post':
                    sw.addPost(spec);
                    break;
                case 'put':
                    sw.addPut(spec);
                    break;
                case 'delete':
                    sw.addDelete(spec);
                    break;
                case 'del':
                    sw.addDelete(spec);
                    break;

            }
        })

    }, this);

    return sw;
}
var Swag = module.exports = {
    modelToSchema:function (m, depends, pluginManager) {
        depends = depends || [];

        if (_u.isString(m))
            m = pluginManager.modelFor(m);
        var model = m.schemaFor();
        var jsonSchema = {
            "id":"http://some.site.somewhere/entry-schema#",
            "$schema":"http://json-schema.org/draft-04/schema#",
            type:"object",
            required:[],
            properties:{
                _id:{
                    type:'string',
                    description:'Identifier for "'+ m.modelName+'"'
                }
            }
        };
        var description = m.description || m.help || m.title;
        var depth = jsonSchema;
        var i = 0;

        walkSchema(model, function (v, k, path) {
            var properties = fix(path, 'properties');
            var subJson = {};
            //    u.depth(jsonSchema, fix(path,'properties', subJson, true));
            //(depth.properties || (depth.properties = {}))[k] = {};
            subJson.type = v.schemaType && v.schemaType.toLowerCase()
            subJson.description = v.description || v.help || v.title;
            if (subJson.type == 'object') {
                subJson.properties = {};
                depth = subJson.properties;
            }
            if (v.schemaType == 'ObjectId') {
                subJson.type = 'object'
                subJson.oneOf = [
                    {$ref:this.pluginUrl + '/' + v.ref}
                ];
                depends.push(v.ref);
            }
            if (v.multiple) {
                subJson.type = 'List';
                if (v.ref)
                    subJson.items = {
                        "$ref":v.ref
                    }
                depends.push(v.ref);
            }
            if (v.type == 'List') {
                subJson.items = {
                    type:subJson.type
                }
                subJson.type = 'List';
            }
            _u.each(v.validators, function (vv, kk) {
                if (vv.type == 'required') {
                    //subJson.required = true;
                    if (path.length == 1) {
                        if (!~jsonSchema.required.indexOf(k))
                            jsonSchema.required.push(k);
                    } else {
                        var pt = util.depth(jsonSchema, fix(path.slice(0, path.length - 1), 'properties'), {});
                        var arr =  pt.required || (pt.required = []);
                        if (!~arr.indexOf(k))
                               arr.push(k);
                    }
                }
                else if (vv.type == 'enum') {
                    delete subJson.type;
                    subJson.enum = vv.enums;
                } else if (vv.type == 'min') {
                    subJson.minimum = vv.min;
                } else if (vv.type == "regexp") {
                    subJson.pattern = vv.regexp;
                } else if (vv.type == 'max') {
                    subJson.maximum = vv.max;
                }
            });
            if (!( subJson.type || subJson.enum))subJson.type = 'object';


            util.depth(jsonSchema, properties, subJson, true);
        }.bind(this));
        return jsonSchema;
    },
    put:function (v, k) {
        var K = inflection.capitalize(k);
        return {
//                "path":"/" + k,
                "notes":"updates a " + K + " in the store",
                "httpMethod":"PUT",
                "summary":"Update an existing " + v.title.toLowerCase(),
                "parameters":[param.post(v.title + " object that needs to be added to the store", k)],
                "errorResponses":[swe.invalid('id'), swe.notFound(k), swe.invalid('input')],
                "responseClass":'void',
                "nickname":"update" +K
            }
    },
    post:function (v, k) {
        var K = inflection.capitalize(k);
        return {
                "notes":"adds a " + K + " to the store",
                "summary":"Add a new " +K + " to the store",
                "httpMethod":"POST",
                "parameters":[param.post(v.title + " object that needs to be added to the store", k)],
                "errorResponses":[swe.invalid('input')],
                "nickname":"add" + K,
                "dataType":k,
                responseClass:"void"
            }
    },
    action:function (req, res, next) {
        var newUrl = '/rest'+req.url;

        req.url = newUrl;
        next();
    },
    params:function (v) {
        var p = [
            param.q('skip', 'number of records to skip', 'int', false, false, 0),
            param.q('limit', 'limit the number of records', 'int', false, false, 10)
        ]
        var filters = [], sort = [], populate = [];
        _u.each(v.schema, function (vv) {

            var k = vv.path;
            if (k == 'id')
                return;
            var type = vv.schemaType;
            if (type == 'Date' || type == 'Number' || type == 'String') {
                filters.push(param.q('filter[' + k + ']', 'filter text fields on ' + k, 'string', false, true));
                sort.push(param.q('sort[' + k + ']', 'sort on ' + k + ' direction ascending 1, descending -1', 'int', false, true, [1, -1]));
            }else{
                populate.push(k)
            }

        })
        if (populate.length){
            p = p.concat(param.q('populate', 'populate field', 'string', false,true, populate))
        }
        return  p.concat(filters, sort);
    },
    finders:function(v,k){
        return _u.map(v.finders, function (vv,kk) {
            if (!vv.spec)
                return;
            var type = vv.spec && vv.spec.method && vv.spec.method.toLowerCase() || 'get';
            var ret = _u.extend(_u.omit(vv.spec, 'method', 'params'), {path:'finder/'+vv.name, parameters:vv.params, httpMethod:type})

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
                "summary":"Return an existing " + v.title,
                "parameters":[param.path("id", "ID of " + v.modelName, "string")],
                "errorResponses":[swe.invalid('id'), swe.notFound(v.modelName)],
                "nickname":"get" + K + "ById",
                "responseClass":'List['+k+']'
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
    Spec:Spec,
    swagger:specify
}