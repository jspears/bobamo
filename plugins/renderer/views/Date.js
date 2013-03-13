define(['libs/moment/moment', 'underscore'], function (m, _) {
    m = m || moment;
    var conf//${nl()} = {{json model.defaults || {format:'MMMM DD YYYY, h:mm:ss a'} }};
    return function (options) {
        options = _.extend({}, conf, options);
        var fmt = options.format;
        return function (value) {
            this.$el.html(m(value).format(fmt));
        }
    }
});