define(['libs/moment/moment'], function(moment){
    var conf = {{json plugin.rendererFor('renderer.DateTime').defaults }};
    return function(value, options){
        var fmt = options && options.format || conf.format;
        this.$el.html( moment(fmt, value));
    }
});