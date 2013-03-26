var bobamo = require('../../index'), path = require('path'), PluginApi = bobamo.PluginApi, DisplayModel = bobamo.DisplayModel, u = require('util');


var ModelLoaderPlugin = function () {
    PluginApi.apply(this, arguments);
    this.conf = {
        modelDir: process.cwd() + '/model/'
    }
}
u.inherits(ModelLoaderPlugin, PluginApi);
ModelLoaderPlugin.prototype.admin = function () {

    return new DisplayModel('modelloader', {
        schema: {
            modelDir: {
                type: 'Text',
                validators:[{type:'required'}],
                help: 'Path to your directory of models'
            }
        },
        title:'Model Loader',
        defaults: this.conf
    });
};
ModelLoaderPlugin.prototype.updateSchema = function (modelName, model) {
    try {
        var m = require(path.join(this.conf.modelDir, modelName))(this.pluginManager.exec('mongoose', 'schemaFor', model), this);
        if (m) {
            try {
                this.options.mongoose.model(modelName, m);
                return true;
            } catch (e) {
                console.error('could not load model [' + modelName + ']', e);
            }
        } else {
            console.log('could not load', modelName, 'Did not return');
        }
    } catch (e) {
        //console.error('could not load ', modelName, e);
    }
}

module.exports = ModelLoaderPlugin;