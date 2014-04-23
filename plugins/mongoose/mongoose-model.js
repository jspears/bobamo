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
    this.all_fields = [];
    var defaults = this.defaults || (this.defaults = {});
    Object.keys(m.schema.tree).forEach(function(k) {
        var d = m.schema.tree[k].default;
        if (typeof d === 'undefined' || !d) return;
        defaults[k] = d;
    });

    this.__defineGetter__('schema', function () {
        var ret = {};
        _u.each(m.schema.tree, function (v,k) {
            if (!k || k === 'undefined' || k == '__v' || (k == 'id' && m.schema.virtualpath(k)) )
                return;
            ret[k] = new MField(k, manager.pluginFor(k, v, m, this));
        }, this);

//        _u.each(m.schema.virtuals, function (v, k) {
//            ret[k] = new MField(k, manager.pluginFor(k, v, m, this));
//        }, this);

        return ret;
    });
    this.__defineGetter__('finders', function(){
        return m.schema.statics;

    });
    //copy display properties over without stepping on anything, should do some more special stuff but for now.
    Object.keys(display).filter(function (v) {
        if (!this.hasOwnProperty(v))
            this[v] = display[v];
    }, this);

}