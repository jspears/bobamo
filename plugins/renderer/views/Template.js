define(['underscore'], function (_) {
    var conf //${nl()} = {{json model.defaults }};
    return function (options) {
        var template = _.template(conf.template || options.template || "<%=value%>");
        return function (value, property, model) {
            this.$el.html(template(_.extend({value:value}, model)));
        }
    }
})