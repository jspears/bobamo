define(['underscore'], function(underscore){
    var conf = {{json model.defaults || {} }};
    return function(value, options){
        var fmt = _.extend({trueDisplay:'true', falseDisplay:'false'}, conf, options);
        if (value)
            this.$el.html(fmt.trueDisplay);
        else
            this.$el.html(fmt.falseDisplay);

    }
});