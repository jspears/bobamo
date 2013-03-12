define(['renderer/js/libs/numeral/numeral'],function(numeral){
    var conf = {{json model.defaults || {} }}
    return function(value, options){
        var fmt = options && options.format || conf.format;
        if (fmt)
            this.$el.html(numeral(value).format(fmt))
        else
          this.$el.html(value);
    }
})
