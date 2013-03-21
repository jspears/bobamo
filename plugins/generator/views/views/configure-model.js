define(['Backbone'], function(B){
    var model //${nl()} = {{json model}}
    console.log('configure', model);
    var Model = B.Model.extend(model)
    Model.prototype.url = '${model.url}' || '${plugin.name}/admin/configure';
    return Model;

})