define(['Backbone', 'underscore', 'libs/editors/multi-editor'], function (B, _) {

    var editors = {{html JSON.stringify(pluginManager.editors)}} || [];

var schema = {};
_.each(editors, function(v,k){
    if (_.isString(v)){
        schema[v] = {type:'Hidden', help:'No Configuration'};
    }else{
      var conf =  schema[v.name] = {type:'Object', subSchema:v.schema || {}}
        _.extend(conf, _.omit(v, 'schema', 'name'));
    }
})
return schema;
});