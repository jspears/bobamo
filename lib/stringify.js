function stringify(obj, indent) {
    return JSON.stringify(obj, this.replacer, indent);
}
function replacer(key, value) {
    if (value === null || value === void(0) || value.constructor !== Object) {
        return value;
    }
    return Object.keys(value).sort().reduce(function (sorted, key) {
        sorted[key] = value[key];
        return sorted;
    }, {});
};
module.exports = {
    stringify: stringify,
    replacer: replacer
}