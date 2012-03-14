/**
 * Used to check and set default options on object.
 * Can be nested.
 * <code>
 *     var a = { b:{c:1}};
 * depth(a, 'b.c', 2) will return 1;
 * depth(a, 'b.c', 2, true) will return 2 and set a.b.c = 2.
 * depth(a, 'd', 1) will return 1  a remains unchanged.
 * depth(a, 'd', 1, true) will make a.d = 1 and return 1;
 *
 * </code>
 * @param obj //object to check
 * @param str // string path to check, can be an array, otherwise it checks  on depth
 * @param val // the value to return
 * @param change //weather to change the original value and structure.
 */
function _depth(obj, str, val, change) {
    if (typeof obj === 'undefined' || obj == null) return val;
    if (typeof str === 'string')
        return _depth(obj, str.split('.'), val, change);

    var f = str.shift();

    var nobj = obj[f];
    var not_defined = typeof nobj === 'undefined';

    if (change === true) {
        if (str.length) {
            if (not_defined)
                nobj = (obj[f] = {});

        } else {
            return (obj[f] = val);
        }
    }

    if (str.length)
        return _depth(nobj, str, val, change);

    return not_defined ? val : nobj;
}
function _defaultOrSet(obj, str, val) {
     if (typeof str === 'string')
        return _defaultOrSet(obj, str.split('.'), val);

    var f = str.shift();
    var nobj = obj[f];
    if (str.length) {
        return _defaultOrSet(typeof nobj === 'undefined' ? ( obj[f] = nobj =  {} ) :  nobj, str, val);
    }
    return typeof nobj == 'undefined' ? (obj[f] = val) : obj[f];

}
function _options(obj) {
    return _value(obj, 'options', {});
}

function _value(obj, key, def) {
    return _depth(obj, key, def, false);
}

module.exports = {
    defaultOrSet:_defaultOrSet,
    depth:_depth,
    value:_value,
    options:_options
}