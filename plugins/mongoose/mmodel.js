var MField = require('./mfield'), util=require('../../lib/util'), _u = require('underscore');
module.exports = function MModel(m, manager) {
    this.__defineGetter__('modelName', function () {
        return m.modelName;
    });
    this.__defineGetter__('plural', function () {
        return util.depth(m, ['plural'], null);
    });
    this.__defineGetter__('title', function () {
        return util.depth(m, ['title'], null);

    });

    this.__defineGetter__('description', function () {
        return m.description;
    });

    var display = util.depth(m, ['schema', 'options', 'display'], {});
    this.fields = display.fields;
    this.list_fields = display.list_fields;
    this.edit_fields = display.edit_fields;
    this.labelAttr = display.labelAttr;
    this.fieldsets = display.fieldsets;
    this.__defineGetter__('paths', function () {
        var ret = {};
        m.schema.eachPath(function (k, v) {
            ret[k] = new MField(k, manager.pluginFor(k, v, m));
        });
        _u.each(m.schema.virtuals, function (v, k) {
            ret[k] = new MField(k, manager.pluginFor(k, v, m));
        });

        return ret;
    });
}