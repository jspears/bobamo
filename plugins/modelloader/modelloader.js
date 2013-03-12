var PluginApi = require('../../index').PluginApi, u = require('util');


var ModelLoaderPlugin = function(){
    PluginApi.apply(this, arguments);
}
u.inherits(ModelLoaderPlugin, PluginApi);
ModelLoaderPlugin.prototype.updateSchema = function(modelName, model){
    try {
        var m = require(process.cwd()+'/model/'+modelName)( this.pluginManager.exec('mongoose' , 'schemaFor', model), this);
        if (m){
            try {
                this.options.mongoose.model(modelName, m);
                return true;
            }catch(e){
                console.error('could not load model ['+modelName+']', e);
            }
        }else{
            console.log('could not load', modelName, 'Did not return');
        }
    }catch(e){
        //console.error('could not load ', modelName, e);
    }
}

module.exports = ModelLoaderPlugin;