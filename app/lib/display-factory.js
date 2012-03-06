var util = require('./util'), _u = require('underscore'), sutil = require('./string'), mongoose = require('mongoose');
var DisplayFactory = function () {

    this.UIModel = {}


};
function _m(Model) {
    if (typeof Model === 'string')
        Model = mongoose.model(Model);
    return Model;
}

function _field(p, path) {
    var defaults = {};
    var options = p.options || {};
    if (options.display && options.display.display == 'none' || ( path[0] == '_' && path != '_id')) {
        return null;
    }

    if (p.instance == 'ObjectID') {
        if (options.ref) {
            _u.extend(defaults, {
                url:'/api/' + options.ref + '?transform=labelval',
                dataType:'String',
                type:'Select',
                key:options.ref,
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
            url:'/api/' + p.ref + '?transform=labelval',
            dataType:'String',
            type:'Select',
            key:p.ref,
            type:'Select',
            mode:'single'
        });
    } else {
        var modelName = util.depth(p, 'caster.options.ref');
        if (modelName) {
//            _u.extend(defaults, {
//                dataType:'Array',
//                url:'/rest/' + modelName + '/labelvalue',
//                type:'MultiEditor'
//            });
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
    if (options.required) {
        util.defaultOrSet(defaults, 'validator', []).push('required');
//        (defaults.validator ? defaults.validator : (defaults.validator = [])).push('required');
    }
    if (p.validators) {
        _u.each(p.validators, function (v, k) {
            if (v.length) {
                if (v[0] instanceof RegExp) {
                    util.defaultOrSet(defaults, 'validator', []).push(v[0]);
                } else {
                    console.warn('can only handle client side regex/required validators for now')
                }
            }
        })
    }
    defaults.title = sutil.toTitle(path);
    return _u.extend({}, defaults, options.display);
}
DisplayFactory.prototype._field = _field
DisplayFactory.prototype.createSchema = function createSchema(Model, User) {
    Model = _m(Model);
    var CModel = util.depth(this.UIModel, Model.modelName, {}, true);

    Model.schema.eachPath(function (k, v) {
        var field = _field(v, k);
        if (field) {
            util.depth(CModel, ['paths', k], field, true);

        }
    }, this);
    _u.each(Model.schema.virtuals, function (v, k) {
        var field = _field(v, k);
        if (field)
            util.depth(CModel, ['paths', k], field, true);

    }, this);

    return CModel;
}
DisplayFactory.prototype.listModels = function listModels(User) {
    return Object.keys(mongoose.modelSchemas);
}
DisplayFactory.prototype.createFields = function createFields(Model, User) {
    Model = _m(Model);
    var fields = util.depth(Model, ['options', 'display', 'fields'], []);
    return (fields && fields.length) ? fields : Object.keys(this.createSchema(Model, User).paths);
}
DisplayFactory.prototype.createDefaults = function createDefaults(Model, User) {
    Model = _m(Model);
    var schema = this.createSchema(Model).paths;
    var defs = {};
    Object.keys(schema).forEach(function (v, k) {
        if (v == '_id' || v == 'id') return;
        defs[v] = null;
    });

    return defs;
}
DisplayFactory.prototype.createTitle = function (Model, user) {
    Model = _m(Model);
    return util.depth(Model, 'options.display.label', sutil.toTitle(Model.modelName));
}

module.exports.DisplayFactory = new DisplayFactory;

var MMContainer = function (mongoose, user) {
    var models = {};


}
var MModel = function (obj) {
    var dg = this.__defineGetter__.bind(this);
    dg('modelName', function () {
        return obj.modelName;
    });

    dg('label', function () {
        return obj.label;
    });
    dg('plural', function () {
        return obj.plural;
    });
    dg('labelAttr', function () {
        return obj.labelAttr;

    });
    dg('paths', function () {

    });
    dg('fields', function () {
       return obj.fields ||  obj.paths;
    });
    dg('edit_fields', function () {
        return obj.edit_fields || _u.filter(obj.fields, function(obj){
          return obj.ro == false;
        });
    });
    dg('display_fields', function () {
        return obj.display_fields || obj.fields;
    });
    dg('list_fields', function () {
        return obj.list_fields || obj.fields;
    });
    dg('show_fields', function () {
        return obj.show_fields || obj.fields;
    });
}

var MField = function (obj) {
    var dg = this.__defineGetter__.bind(this);
    dg('path', function () {
        return obj.path;
    })
    dg('label', function () {
        return obj.label;
    });
    dg('title', function () {
        return obj.title;

    });

    dg('type', function () {
        return obj.type;
    });

    dg('dataType', function () {
        return obj.dataType;

    });

    dg('plural', function () {
        return obj.plural;
    });
    dg('ro', function () {
        return obj.ro;
    });
    dg('display', function () {
        return obj.display;
    });
    dg('url', function () {
        return obj.url;
    });
    dg('options', function () {
        return obj.options;
    });

}