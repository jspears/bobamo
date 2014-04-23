define(['underscore'], function (_) {
    var conf //${nl()} = {{json model.defaults || {} }};
    return function (options) {
        var fmt = _.extend({trueDisplay: 'true', falseDisplay: 'false'}, conf, options);
        return function (value) {
            if (value)
                this.$el.html(fmt.trueDisplay);
            else
                this.$el.html(fmt.falseDisplay);
        }
    }
});