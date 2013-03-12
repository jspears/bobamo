define(['libs/moment/moment'], function(m){
    m = m || moment;
    var conf = {{json model.defaults || {format:'MMMM DD YYYY, h:mm:ss a'} }};
    return function(value, options){
        var fmt = options && options.format || conf.format;
        this.$el.html(moment(value).format(fmt));
    }
});