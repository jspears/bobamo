var util = require('./util'), _u = require('underscore');
var DisplayFactory = (function (mongoose) {

    this.UIModel = {}


});
function _m(Model) {
    if (typeof Model === 'string')
        Model = mongoose.model(Model);
    return Model;
}

function _field(p, path) {
    var defaults = {};
    var options = p.options || {};
    if (p.instance == 'ObjectID') {
        if (options.ref) {
            _u.extend(defaults, {
                url:'/rest/' + options.ref + '/labelvalue',
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
            url:'/rest/' + p.ref + '/labelvalue',
            dataType:'String',
            type:'Select',
            key:p.ref,
            type:'Select',
            mode:'single'
        });
    } else {
        var modelName = util.depth(p, 'caster.options.ref');
        if (modelName) {
            _u.extend(defaults, {
                dataType:'Array',
                url:'/rest/' + modelName + '/labelvalue',
                type:'MultiEditor'
            });
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
                console.log('No Type?', p);
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
                if (v[0] instanceof RegExp)
                    util.defaultOrSet(defaults, 'validator', []).push(v[0]);
            }
        })
    }
    defaults.label =
    return _u.extend({}, defaults, options.display);
}
DisplayFactory.prototype._field = _field
DisplayFactory.prototype.createFields = function createFields(Model) {
    Model = _m(Model);
    var CModel = util.depth(this.UIModel, Model.modelName, {}, true);

    Model.schema.eachPath(function (k, v) {
        var field = _field(v, k);
        util.depth(CModel, k, field, true);
    });
    return CModel;
}
DisplayFactory.prototype.createBackboneForm = function createBackboneForm(Model) {
    Model = _m(Model);


    var options = util.depth(this.UIModel, [Model.modelName], 'options');
    if (!options.fields) {

        options.fields = createFields(Model);
    }
    var ref = _value(options, 'ref');


}

module.exports.DisplayFactory = DisplayFactory;
