define(['underscore'], function (_) {
    var conf //${nl()} = {{json  model.defaults }};
    return function (options) {
        options = _.extend({}, conf, options);
        var display = options.display;

        return display ? function (value, options) {
            this.$el.css({display: display}).html(value);
        } : function () {
        }
    }
});