var bobamo = require('../../index'),
    _u = require('underscore'),
    inflection = bobamo.inflection, Model = bobamo.DisplayModel
    Swag = require('./swag-utils')
    ;
var swagger = require("./lib/swagger");
var util = require('../../lib/util');
var param = require("./lib/paramTypes");
var url = require("url");
var swe = swagger.errors;


var Spec = function (args, finder, path) {
    var display = finder.display || {};
    var _responseModel, _requestModel;
    this.responseModel = function () {
        if (_responseModel)
            return _responseModel;

        if (!display.responseModel)
            return (_responseModel = finder.parent());
        var modelName = display.responseModel.modelName || inflection.classJoin(finder.parent().modelName, finder.name);
        _responseModel = new Model(modelName, [display.responseModel])
        return  _responseModel;
    }

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
        if (display.hidden)
            return;
        var defP = finder.display && (finder.display.params || finder.display.parameters) || util.find('params', args) || util.find('parameters', args)
        console.log('Spec->params', finder.name, defP);
        if (defP) {

            return defP;
        }
        if (method == 'GET') {
  //          parameters = parameters.concat(Swag.params(finder.display, finder.modelName));
            var model = this.responseModel();
            parameters = parameters.concat(Swag.params(model, model.modelName));
            if (display.schema){
                _u.each(display.schema, function (vv, kk) {
                    var required = _.first(_.where(vv.validators, {type:'required'})) || false;
                    parameters.push({
                        allowMultiple:false,
                        dataType:Swag.fromType(vv.schemaType || vv.type) || 'string',
                        description:vv.help || vv.description,
                        name:kk,
                        paramType:display.paramType || 'query',
                        required:required});
                });

            }
        }else if (method == 'POST'  || method == 'PUT' || method == 'DELETE'){
            /* "description":"Array of words to add to WordList",
             "required":false,
             "dataType":"Array[StringValue]",
             "valueTypeInternal":"com.wordnik.resource.StringValue",
             "allowMultiple":false,
             "paramType":"body"*/
            // parameters.push
            var dataTypeModel;
            var dataType = finder.model && finder.model.modelName;
            var description = finder.description
            if (display.schema ){
                dataType = inflection.classJoin(dataType, finder.name);
                dataTypeModel = new Model(dataType, [display]);
                description = dataTypeModel.description || dataTypeModel.help || dataTypeModel.title || description;
            }
            parameters.push({
                allowMultiple:false,
                dataType:dataType,
                description:description,
                dataTypeModel:dataTypeModel,
                paramType:'body',
                required:true});
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
        return 'finder/' + util.find('name', [finder]);
    });
    this.__defineGetter__('notes', function () {
        return util.find('notes', args) || util.find('title', [finder])
    });

//    ['summary', 'method'].forEach(util.easyget(args), this);

    this.__defineGetter__('responseClass', function () {
        var rc = util.find('responseClass', [ display].concat(args));
        if (rc) {
            return rc;
        }
        rc = this.responseModel().modelName;
        return (this.method == 'POST' || this.method == 'DELETE') ?  'void' :  display.multiple !== false ? rc : "List[" + rc + "]";
    });

    this.__defineGetter__('nickname', function () {
        return util.find('nickname', args) || finder.name;

    });

    this.__defineGetter__('method', function () {
        var m = util.find('method', args) || util.find('httpMethod', args);
        if (m)
            return m.toUpperCase();
        if (display.method)
            return display.method.toUpperCase();
        if (display.httpMethod)
            return display.httpMethod.toUpperCase();

        return 'GET';

    });
    this.__defineGetter__('summary', function () {
        if (finder && finder.display && finder.display.summary)
            return finder.display.summary;
        return finder.help || finder.description || finder.title;

    });
}
var Finder = bobamo.FinderModel

Finder.prototype.__defineGetter__('spec', function () {
    return new Spec([this.display.spec], this)
});
/**
 * Specifies which actions are allowed on an object.
 * by default all are.  Otherwise it would be
 * 'findOne', 'findAll', 'create', 'update', 'remove'...
 */
bobamo.DisplayModel.prototype.__defineGetter__('allowedMethods', function(){
    var args = this._args();
    var allowed = util.find('allowedMethods', args);
    return allowed;
});
module.exports = Spec;