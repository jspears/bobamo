var util = require('./util'), _u = require('underscore'), inflection = require('./inflection');
module.exports = function (options) {

    var mongoose = options.mongoose;
    if (!mongoose) {
        mongoose = options;
        options = {};
    }

    if (!options.default_editors)
        options.default_editors = ['Base',
            'Checkbox',
            'Checkboxes',
            'Date',
            'DateTime',
            'Hidden',
            'List',
            'NestedModel',
            'Number',
            'Object',
            'Password',
            'Radio',
            'Select',
            'Text',
            'TextArea'];

    if (!options.read_only)
        options.read_only = ['id', '_id', 'created_at', 'modified_at', 'created_by', 'modified_by'];

    if (!options.api)
        options.api = '/api';
    if (!options.basepath)
        options.basepath = '';
    var apiPath = options.apiPath;
    if (!apiPath)
        apiPath = (options.basepath+options.api).replace(/\/\//g, '/');
    if (apiPath[apiPath.length - 1] != '/')
        apiPath = apiPath+'/';
    if (apiPath[0] != '/')
        apiPath = '/'+apiPath;

    var MongooseAdapter = function () {
        this.__defineGetter__('modelPaths', function () {
            var ret = {};
            _u.each(mongoose.models, function (v, k) {
                ret[v.modelName] = new MModel(v);
            }, this);
            return ret;
        });
    };

    function MModel(m) {
        var Model = _m(m);
        this.__defineGetter__('modelName', function () {
            return m.modelName;
        });
        this.__defineGetter__('plural', function () {
            return util.depth(m, ['plural'], inflection.titleize(inflection.pluralize(inflection.humanize(Model.modelName))));
        });
        this.__defineGetter__('title', function () {
            return util.depth(m, ['title'], inflection.titleize(inflection.humanize(Model.modelName)));

        });
        this.__defineGetter__('description', function () {
            return m.description;
        });
        var display  = util.depth(Model, ['schema','options','display'], {});
        this.fields = display.fields;
        this.list_fields =  display.list_fields;
        this.edit_fields = display.edit_fields;
        this.labelAttr = display.labelAttr;
        this.fieldsets = display.fieldsets;
        console.log('schema', Model.schema);
        this.__defineGetter__('paths', function () {
            var ret = {};
            m.schema.eachPath(function (k, v) {
                ret[k] = new MField(k, v);
            });
            _u.each(m.schema.virtuals, function (v, k) {
                ret[k] = new MField(k, v);
            });

            return ret;
        });
    }

    function MField(p, f) {
        this.path = p;
        var field = _field(f, p);
        _u.extend(this, field);
    }

    function _m(Model) {
        if (typeof Model === 'string')
            Model = mongoose.model(Model);
        return Model;
    }

    function _field(p, path) {
        var defaults = {};
        var opts = p.options || {};
        if (opts.display && opts.display.display == 'none' || ( path[0] == '_' && path != '_id')) {
            return null;
        }
        if (p.instance == 'ObjectID') {
            if (options.ref) {

                _u.extend(defaults, {
                    url:apiPath + opts.ref + '?transform=labelval',
                    dataType:'String',
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
                url:apiPath+ p.ref + '?transform=labelval',
                dataType:'String',
                type:'Select',
                mode:'single'
            });
        } else {
            var modelName = util.depth(p, 'caster.options.ref');
            if (modelName) {
                _u.extend(defaults, {
                    dataType:'Array',
                    url:apiPath + modelName + '?transform=labelval',
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
                        util.defaultOrSet(defaults, 'validator', []).push('/'+v[0]+'/');
                    } else {
                        console.warn('can only handle client side regex/required validators for now')
                    }
                }
            })
        }
        defaults.title = _title(path);
        return _u.extend({}, defaults, opts.display);
    }



    function _title(str) {
        return inflection.titleize(inflection.humanize(str));
    }


    return new MongooseAdapter();
}
