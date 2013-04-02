define(function () {
    var conf //${nl()} = {{json model.defaults || {} }};

    return function (options) {
        return function (value) {
            this.$el.html(value ? value.join(',') :'');
        }
    }
})