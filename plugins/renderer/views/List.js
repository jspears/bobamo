define(function () {
    var conf //${nl()} = {{json model.defaults }};
    return function (options) {
        var label = options.label || conf.label || 'count';
        return function (value) {
            this.$el.html(label+' (' + value.length + ')');
        }
    }
})