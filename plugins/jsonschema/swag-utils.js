var param = require("./lib/paramTypes"), _u = require('underscore');
var typeRe =/List\[([^\]]*)\]/;
var builtin_types = 'byte boolean int long float double string Date void'.split(' ');

module.exports = {
    builtin_types:builtin_types,
    typeNotBuiltin:function(type){
        type = this.extractType(type);
        return ~builtin_types.indexOf(type) ?  null : type;
    },
    extractType:function(type){
        return type && type.replace(typeRe, "$1");
    },
    fromType:function fromType(type, obj) {
        for (var i = 0, l = arguments.length; i < l; i++) {
            var t = arguments[i];
            if (!t)
                continue;
            t = t.toLowerCase();

            if (t == 'string' || t == 'boolean' || t == 'int' || t == 'double' || t == 'Date' || t == 'void')
                return t;

            if (t == 'number')
                return 'number'

            if (t == 'text' || t == 'textarea' || t == 'password')
                return 'string'

            if (t == 'datetime' || t == 'date')
                return 'Date'
            if ( t == 'checkbox')
                return 'boolean'

            if (t == 'integer' || t == 'int')
                return 'integer';

            if (t == 'list' || t == 'array')
                return 'array';

            if (t == 'object' || t == 'objectid' || t == 'nestedmodel')
                return 'object'

        }
        return null;
    },
    params:function (v) {
        var p = [
            param.q('skip',   'number of records to skip',    'int', false, false, null, 0),
            param.q('limit', 'limit the number of records', 'int', false, false, null, 10)
        ]
        var filters = [], sort = [], populate = [];
        _u.each(v.schema, function (vv, k) {

//            var k = vv.path;
            if (k == 'id')
                return;
            var type = vv.schemaType;
            if (type == 'Date' || type == 'Number' || type == 'String') {
                filters.push(param.q('filter[' + k + ']', 'filter '+type +' fields on ' + k + ' supports &gt;, &lt; modifiers', 'string', false, false));
                sort.push(param.q('sort[' + k + ']', 'sort on ' + k + ' direction ascending 1, descending -1', 'int', false, false, [1,  -1]));
            } else if (vv.subSchema){
                populate.push(k)
            }

        })
        if (populate.length) {
            p = p.concat(param.q('populate', 'populate field', 'string', false, true, populate))
        }
        return  p.concat(filters, sort);
    }
}