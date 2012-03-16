var util = require('./util'), _u = require('underscore'), inflection = require('./inflection');
module.exports = function (options) {
    var mongoose = options.mongoose || options;
    var DisplayFactory = function () {

        this.UIModel = {}
        this.default_editors = ['Base',
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
        this.read_only = ['id', '_id', 'created_at', 'modified_at', 'created_by', 'modified_by']
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
                    url:this.api + options.ref + '?transform=labelval',
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
                url:this.api + p.ref + '?transform=labelval',
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
                    url:this.api + modelName + '?transform=labelval',
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
                        util.defaultOrSet(defaults, 'validator', []).push(v[0]);
                    } else {
                        console.warn('can only handle client side regex/required validators for now')
                    }
                }
            })
        }
        defaults.title = inflection.titleize(inflection.humanize(path));
        return _u.extend({}, defaults, options.display);
    }

    DisplayFactory.prototype._field = _field
    DisplayFactory.prototype.createSchema = function createSchema(Model, User) {
        Model = _m(Model);
        var CModel = util.depth(this.UIModel, ['models', Model.modelName], {}, true);

        var depth = {};
        var self = this;
        Model.schema.eachPath(function (k, v) {
            var field = self._field(v, k);
            if (field) {
                var parts = k.split('.');
                if (parts.length == 1)
                    util.depth(CModel, ['paths'].concat(parts), field, true);
                else {
                    var pop = parts.pop();
                    util.depth(CModel, ['paths'].concat(parts, 'type'), 'Object', true);
                    util.depth(CModel, ['paths'].concat(parts, 'subSchema', pop), field, true);

                }

            }
        });
        _u.each(Model.schema.virtuals, function (v, k) {
            var field = self._field(v, k);
            if (field)
                util.depth(CModel, ['paths'].concat(k.split('.')), field, true);

        });
        if (Model.options.display) {
            util.depth(CModel, ['display'], Model.options.display || {}, true);
        }
        util.depth(CModel, ['display', 'plural'], inflection.titleize(inflection.pluralize(inflection.humanize(Model.modelName))), true);
        util.depth(CModel, ['display', 'title'], inflection.titleize(inflection.humanize(Model.modelName)), true);

        util.depth(CModel, ['modelName'], Model.modelName, true);
        return CModel;
    }
    DisplayFactory.prototype.createAppModel = function createAppModel(Model, User) {
        Model = _m(Model);
        var CModel = {};

        var self = this;
        Model.schema.eachPath(function (k, v) {
            var field = self._field(v, k);
            if (field) {
                var parts = k.split('.');
                if (parts.length == 1)
                    util.depth(CModel, ['paths'].concat(parts), field, true);
                else {
                    var pop = parts.pop();
                    util.depth(CModel, ['paths'].concat(parts, 'type'), 'Object', true);
                    util.depth(CModel, ['paths'].concat(parts, 'subSchema', pop), field, true);

                }

            }
        });
        _u.each(Model.schema.virtuals, function (v, k) {
            var field = self._field(v, k);
            if (field)
                util.depth(CModel, ['paths'].concat(k.split('.')), field, true);

        });
        if (Model.options.display) {
            util.depth(CModel, ['display'], Model.options.display || {}, true);
        }
        util.depth(CModel, [ 'plural'], inflection.titleize(inflection.pluralize(inflection.humanize(Model.modelName))), true);
        util.depth(CModel, ['title'], inflection.titleize(inflection.humanize(Model.modelName)), true);
        util.depth(CModel, ['modelName'], Model.modelName, true);
        return CModel;
    }
    DisplayFactory.prototype.listModels = function listModels(User) {
        return Object.keys(mongoose.modelSchemas);
    }
    function filterRo(v) {
        return 0 > this.read_only.indexOf(v);
    }

    DisplayFactory.prototype.createFields = function createFields(Model, User) {
        Model = _m(Model);
        var Schema = this.createSchema(Model, User);
        return util.depth(Schema, [ 'display', 'fields'], Object.keys(Schema.paths).filter(filterRo, this));
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
    DisplayFactory.prototype.createEditors = function (Model, user) {
        Model = _m(Model);
        var CSchema = this.createSchema(Model, user).paths;
        var ret = {};
        var def = false;
        _u.each(CSchema, function (v, k) {
            if (!v.type)
                return;

            if (this.default_editors.indexOf(v.type) > -1)
                def = true;
            else
                ret['libs/editors/' + inflection.hyphenize(v.type)] = true;
        }, this)
        var stuff = Object.keys(ret);
        if (def)
            stuff.unshift('jquery-editors')
        return stuff;
    }
    DisplayFactory.prototype.createApp = function (user) {
        var package = require(process.cwd() + '/package.json');
        var UIModel = this.UIModel;
        util.depth(UIModel, 'options.display.title', _title(package.name), true);
        util.depth(UIModel, 'options.display.version', package.version, true);
        util.depth(UIModel, 'options.display.description', package.description, true);

        return UIModel;
    }
    DisplayFactory.prototype.app = function (user) {
        var package = require(process.cwd() + '/package.json');
        var UIModel = {modelPaths:{}};
        util.depth(UIModel, 'title', _title(package.name), true);
        util.depth(UIModel, 'version', package.version, true);
        util.depth(UIModel, 'description', package.description, true);
        _u.each(mongoose.models, function(v,k){
            UIModel.modelPaths[k] = this.createAppModel(v)
        },this);
        return UIModel;
    }
    DisplayFactory.prototype.createTitle = function (Model, user) {
        Model = _m(Model);
        return util.depth(Model, 'options.display.label', inflection.titleize(inflection.humanize(Model.modelName)));
    }
    function _load(path, file) {

    }

    function _title(str) {
        return inflection.titleize(inflection.humanize(str));
    }

    DisplayFactory.prototype.api = '/api/'

    return new DisplayFactory();
}
