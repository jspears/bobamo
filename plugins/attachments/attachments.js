var bobamo = require('../../lib/index'), PluginApi = bobamo.PluginApi, util = require('util');

var defaultConf = {
    directory: path.join(__dirname, "public"),
    providerName: 'localfs'
}

function AttachmentsPlugin() {
    PluginApi.apply(this, arguments);

}
util.extend(AttachmentsPlugin, PluginApi);

AttachmentsPlugin.prototype.editors = [
    {
        name: 'LocalUpload',
        types: ['File'],
        schema: {
            directory: {
                type: 'Text',
                help: 'Directory store uploads'
            }
        }

    }
]
AttachmentsPlugin.prototype.updateSchema = function (modelName, model) {

    model = model || this.pluginManager.appModel.modelPaths[modelName];
    var properties = {};
    Object.keys(model.schema).map(function(k){
          var v = model.schema[k];
          if (v.type === 'LocalUpload'){
              properties[k] = {};
          }
    });

};
module.exports = AttachmentsPlugin;