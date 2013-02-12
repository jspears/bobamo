var _u = require('underscore'),
    inflection = require('./inflection'),
    util = require('./util'),
    toSubSchema = util.toSubSchema,
    easyget = util.easyget,
    find = util.find,
    findAll = util.findAll,
    global_options = require('./globals'),
    Finder = require('./finder-model')
    ;

function contains(arr, value) {
    return arr && ~arr.indexOf(value);
}
function filterRO(v, k) {
    return  !~global_options.read_only.indexOf(v);
}

function Model(modelName, args, nofinder) {
    this.modelName = modelName;
    args = args ? Array.isArray(args) ? args : [args] : [];
    this._args = function(){
        return args;
    }

    this.__defineGetter__('title', function onTitle() {
        var title = find('title', args) || inflection.titleize(inflection.humanize(modelName));
        return title;
    });
    this.__defineGetter__('plural', function onTitle() {
        var plural = find('plural', args) || inflection.titleize(inflection.pluralize(inflection.humanize(modelName)));
        return plural;
    });
    this.__defineGetter__('labelAttr', function onLabelAttrGet() {
        var labelAttr = find('labelAttr', args);
        if (labelAttr) return labelAttr;
        var labels = ['label', 'name', 'title'];
        for (var i = 0, l = labels.length; i < l; i++) {
            if (this.fields.indexOf(labels[i]) > -1)
                return labels[i];
        }
    });
    this.__defineGetter__('fields', function onFieldsGet() {
        var fields = find('fields', args);
        if (!fields) {
            fields = Object.keys(util.flatten(this.schema));
        }
        return fields;
    });
    this.__defineGetter__('edit_fields', function onEditFieldsGet() {
        var fields = find('edit_fields', args);
        if (!fields) {
            fields = this.fields.filter(filterRO, this.app);
        }
        return fields;
    });
    this.__defineGetter__('list_fields', function onListFieldsGet() {
        var fields = find('list_fields', args);
        if (!fields)
            fields = this.fields.filter(function (v, k) {
                return !(v == 'id' || v == '_id' || v == 'id_')
            });
        return fields;
    });
    this.__defineGetter__('fieldsets', function onFieldSetsGet() {
        var fieldsets = find('fieldsets', args);
        if (fieldsets)
            return fieldsets;
        return [
            {legend:this.title, fields:this.edit_fields}
        ]
    });

    if (!nofinder)
        this.__defineGetter__('finders', function onFindersGet() {
            var finders = find('finders', args);
            if (finders && !Array.isArray(finders)) {
                finders = [ finders];
            } else {
                finders = _u.flatten(finders);
            }

            var ret = _u.flatten(finders.map(function (finder, kk) {
                return _u.map(finder, function (v, k) {
                    return new Finder(v, k, this);
                }, this)
            }, this));
            return ret;
        });
    this.__defineGetter__('schema', subSchemaMap(null, args));

    ['help', 'description', 'buttons', 'events', 'defaults', 'url', 'urlRoot'].forEach(easyget(args), this);
}

function noHidden(v) {
    return !v && v.display && v.display.hidden
}


Model.prototype.finder = function onFindFinder(name) {
    var finders = this.finders;
    var found = _u(finders).find(function (f) {
        return f.name == name
    });

    return found;
}

Model.prototype.pathFor = function (path) {
    var ret = util.depth(this.schema, toSubSchema(path));
    if (!ret) {
        ret = {
            title:inflection.titleize(inflection.humanize(path)),
            path:path

        }
    }
    return ret;
}

Model.prototype.fieldsFor = function (list_type) {
    if (!list_type)
        list_type = this.fields;
    else if (typeof list_type == 'string') {
        list_type = this[list_type];
    }
    var ret = {};
    _u(list_type).each(function (k, i) {
        var ks = toSubSchema(k);
        ret[k] = util.depth(this.schema, ks);
    }, this);
    return ret;
};

Model.prototype.schemaFor = function onCreateSchema(fields) {
    var f = [];
    fields = fields || this.fieldsets || this.edit_fields || this.list_fields;

    _u(fields).each(function (v, k) {
        if (v.fields) {
            f = f.concat(v.fields);
        } else {
            f.push(v);
        }
    })
    var flatFields = this.fieldsFor(f);
    var schema = {};
    _u(flatFields).each(function (v, k) {
        util.depth(schema, toSubSchema(k), v, true);
    })

    return schema;
};


function collapseFields(args) {
    var keys = [];
    args.forEach(function onCollapseKeys(arg) {
        if (!arg)
            return;
        //catch when type is not defined in a schema
        if (typeof arg == 'string')
            keys.push('type');
        else
            keys = keys.concat(Object.keys(arg));
    })
    return _u(keys).unique();
}
function fixType(v) {
    if (_u.isString(v))
        return {type:v}
    return v;
}
function subSchemaMap(path, args) {
    return function () {

        var subSchema = ((findAll('subSchema', args) || []).concat((findAll('schema', args) || []))).filter(falsy);
        //not sure why  && (this.type == 'Object' || this.type == 'List')  was there, seems I should just let it be...
        if (subSchema) {
            var ret = {}
            _u.each(subSchema, function onSubSchemaNest(v, k) {
                _u(v).each(function (vv, kk) {
                    (ret[kk] || (ret[kk] = [])).push(vv)
                });
            });
            _u.each(ret, function onSubSchemaField(v, k) {
                var np = path ? [path, k].join('.') : k;
                ret[k] = new Field(np, v, this);
            }, this);
            return Object.keys(ret).length ? ret : null;
        }

    }
}
function falsy(v) {
    return v && v !== 'undefined';
}
function Field(path, args, parent) {
    this.path = path;
    args = (Array.isArray(args) ? args : [args]).filter(falsy).map(fixType, this);
    this.__defineGetter__('type', function onTypeField() {
        var type = util.find('type', args);
        if (type)
            return type;
        if (this.subSchema) {
            return this.multiple ? 'List' : 'Object';
        }
        return 'Text'

    });
    this.__defineGetter__('title', function onFieldTitle() {

        var title = find('title', args) || inflection.titleize(inflection.humanize(this.path.split('.').join(' ')));
        return title;
    });
    this.__defineGetter__('modelName', function onModelName() {
        return find('modelName', args);
    });
    this.__defineGetter__('subSchema', subSchemaMap(path, args));

    var fields = collapseFields(args).filter(function (v) {
        return !this.hasOwnProperty(v)
    }, this);
    fields.forEach(easyget(args), this);

    this.matches = function (path) {
        var fp = _u.isArray(path) ? path : path.split('.');

        var ret = fp.pop() == this.path.split('.').pop();
        return  (ret && parent) ? parent.matches(fp) : ret;
    }
}
Finder._Model = Model;
module.exports = Model;