define(['renderer/js/libs/numeral/numeral'], function (numeral) {
    var conf //${nl()}= {{json model.defaults || {} }}
    return function (options) {
        var fmt = options && options.format || conf.format;
        return fmt ? function (value) {
            this.$el.html(numeral(value).format(fmt))
        } : function (value) {
            this.$el.html(''+value);
        }
    }
})
