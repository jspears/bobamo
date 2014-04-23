define(['underscore'], function (_) {
    var conf//${nl()} = {{json model.defaults || {} }}
    return function (options) {
        options = _.extend({}, conf.default, options);
        var maxLength = options.maxLength;
        var defValue = options.defaultValue;
        var ellipsis = options.ellipsis || '...';
        return function (value) {
            if (!value) {
                this.$el.html(defValue || '');
            } else if (maxLength) {
                this.$el.html(value.substring(0, Math.min(Math.max(maxLength - ellipsis.length, ellipsis.length), value.length)) +
                    value.length + 3 > ellipsis.length ?
                    ellipsis : '');
            } else {
                this.$el.html(value || '');
            }
        }
    }
})
