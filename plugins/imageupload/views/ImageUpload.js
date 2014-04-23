define(['replacer', 'underscore'], function(replacer,_){
    var conf //${nl()}= {{json model.defaults || {} }}
    return function(options){
        options = _.extend({}, conf, options);
        return function(value, property, model){
            this.$el.html('<img src="/imageupload/'+options.thumbnail+'/'+value+'"/>');
        }
    }
})