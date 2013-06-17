var swagger = require('./genschema'),_u = require('underscore'), su = require('./swag-utils');

var baseDoc = function(swagUrl, version){
    return  {
        apiVersion:version,
        swaggerVersion:"1.1",
        basePath:swagUrl+"/api-docs/",
        apis:[]
    }
}

module.exports.resources = function(modelPaths, swagUrl, version){
    var doc = baseDoc(swagUrl, version);
    var apis = doc.apis =  [];
    _u.each(modelPaths, function (v, k) {
        if (v.allowedMethods && v.allowedMethods.length == 0){
            return
        }
        apis.push( {
            path:"/"+ k,
            description:v.description || v.help || ''
        })
    });
    return doc;

}

var silent_methods = ['find', 'findById','create','update','remove']
module.exports.resourceFor = function(model, swagUrl, version, resolver){
    resolver = resolver || function(v){
        return v;
    }
    var modelName = model.modelName;
    var ops = {};
    var doc = baseDoc(swagUrl, version);
    doc.models = {};
    var allowed = model.allowedMethods;
    function isAllowed( method){
        if  (!allowed || ~allowed.indexOf(method))
           return swagger[method].call(swagger, model, modelName);
    }
    _u.each(_u.flatten([
        isAllowed('find'),
        isAllowed('findById'),
        isAllowed('create'),
        isAllowed('update'),
        isAllowed('remove'),
        swagger.finders(model, modelName)

    ]), function forEachOperation(ret,v) {
        if (!ret){
            return;
        }
        _u.extend({
            httpMethod:'GET'
        }, ret)
        var restPath = ['/', modelName, (ret && ret.path ? '/' + ret.path : '')].join('');
        _u.each(ret.parameters, function forEachParameter(v) {
            if (v.paramType == 'path') {
                restPath += '/{' + v.name + '}'
            }else if (v.paramType == 'body'){
//               var pType = v.dataType && v.dataType.replace(typeRe, "$1");
                var pType = su.typeNotBuiltin(v.dataType);
                if (pType){
                    if (!doc.models[pType]){
                        var _v = ret.httpMethod === 'POST';
                        var _model = doc.models[pType] = swagger.modelToSchema( v.dataTypeModel || resolver(pType),doc.models, v.transactional, true, _v);

                        doc.models[pType].id = pType;
                        if (_v && _model){
                            delete _model.properties._id;
                            delete _model.properties._v;
                            delete _model.properties.__v;

                        }
                        delete v.dataTypeModel;
                    }
                }
            }
        });
        var rName = su.typeNotBuiltin(ret.responseClass);

        if (rName) {
            if (!doc.models[rName]) {
                doc.models[rName] = swagger.modelToSchema( resolver(ret.responseModel ||rName),  doc.models);
                doc.models[rName].id = rName;
            }
        }
        function resolve(transaction, hasId, version){
            Object.keys(doc.models).filter(function(v){ return !doc.models[v]}).forEach(function(k){
                doc.models[k] = swagger.modelToSchema(resolver(k), doc.models, transaction, hasId, version);
                doc.models[k].id = k;
                resolve();
            });
        }
        resolve();

        (ops[restPath] || (ops[restPath] = [])).push(_u.omit(ret, 'responseModel'));

    });

    doc.apis = _u.map(ops, function (v, k) {
        return {
            path:k,
            operations:v,
            description:'Operations about ' + modelName
        };
    });

    doc.resourcePath = '/' + model.modelName;
    return doc;
}