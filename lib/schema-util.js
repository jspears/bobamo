var _u = require('underscore'), inflection=require('./inflection');
var builtin_editors = ['Checkbox',
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
    'TextArea']
function pathify(schema) {
    var paths = [];

    function onPath(prev, obj) {
        return function (v, k) {
            var c = _.isString(v)? (obj[k] = {type:v}) : v;
            if (!c.path) {
                c.path = [prev, k].join('.');
            }
            paths.push(c.path);
            _u.each(v.subSchema, onPath(v.path, v.subSchema))
        }
    }
    schema = schema.schema || schema;
    _u.each(schema.schema || schema, onPath('', schema));
    return paths;
}
function includes(schema, fields) {
    var editors = {};
    var hasFields = fields && fields.length;
    if (hasFields)
        pathify(schema);

    function onSchema(v, k) {
        if (!hasFields || ~fields.indexOf(v.path))
            editors[v.type || v] = true;
        _u.each(v.subSchema, onSchema);
    }

    _u.each(schema, onSchema)


    return _u.map(_u.difference(_u.keys(editors), builtin_editors), function (v) {
        return 'libs/editors/' + inflection.hyphenize(v);
    });

}
module.exports = {
    includes:includes,
    pathify:pathify
}