define(function(){
    var conf = {{json  model.defaults }};
    var display = conf && conf.display;
    return function(value, options){
        display = options.display || display;
        //if it is display hidden otherwise just suck up the val.
        if (display){
            this.$el.css({display:display}).html(value);
        }

    }
});