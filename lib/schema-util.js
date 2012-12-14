var _u = require('underscore'), inflection = require('./inflection'), builtin_editors = require('./globals').builtin_editors;
function pathify(schema) {
    var paths = [];

    function onPath(prev, obj) {
        return function (v, k) {
            var c = _.isString(v) ? (obj[k] = {type:v}) : v;
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
//    var hasFields = fields && fields.length;
//    if (hasFields)
//        pathify(schema);

    function onSchema(v, k) {
        if (v) {
            editors[_u.isString(v) ? v : v.type] = true;
            _u.each(v.subSchema, onSchema);
        }
    }

    if (_u.isArray(schema))
        _u.each(schema, function (v) {
            _u.each(v.schema || schema, onSchema)
        });
    else
        _u.each(schema.schema || schema, onSchema)

    return _u.chain(editors).keys().difference(builtin_editors).map(function (v) {
        return v == 'undefined'? null : 'libs/editors/' + inflection.hyphenize(v);
    }).compact().value();

}

module.exports = {
    includes:includes,
    pathify:pathify
}