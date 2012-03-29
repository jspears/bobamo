define(['underscore'], function (_) {
    var re = /{([^}]*)}/g;

    return function (tmpl, opt) {
        var o = opt || this;
        if (!tmpl)
            return;
        return tmpl.replace(re, function onReplace(j, k, l) {
            var v = o[k];
            if (_.isUndefined(v)) {
                var parts = k.split(':', 2);
                if (_.isUndefined(o[parts[0]]))
                    v = o[parts[0]];
                else if (parts.length > 1)
                    v = parts[1];
                else
                    v = parts[0];

            }
            return _.isFunction(v) ? v.apply(o, Array.prototype.slice.call(arguments)) : v
        });
    }
})