define(['Backbone','underscore'], function (B, _) {

    var renderers = {{json pluginManager.renderers}};

    var schema = {};
    _.each(renderers, function(arr,k){
        _.each(arr, function(v){
            var conf =  schema[[k,v.name].join('/')] = {type:'Object', subSchema:v.schema || {}}
            _.extend(conf, _.omit(v, 'schema', 'name'));
        });
    });
    return schema;
});
