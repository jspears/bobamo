
var RendererPlugin = require('../renderer'), _ = require('underscore');
var plugin;
module.exports = {
    setUp:function(next){
        plugin = new RendererPlugin();
        plugin.conf = {
            "static/Multiple":{
                "defaults":{
                    "itemType":"markdown/Markdown",
                    "number":"3"
                }
            },
            "renderer/JunkText":{
                "defaults":{
                    "itemType":"static/Text",
                    "number":3
                },
                "ref":"static.Multiple"
            },
            "renderer/NewJunkText":{
                "defaults":{
                    "itemType":"static/Number",
                    "number":2
                },
                "ref":"renderer.JunkText"
            }
        }
        plugin.pluginManager = {
            renderers:{
                'renderer':plugin.renderers(),
                'static':require('../../static/renderers')
            },
            exec:function(plugin, method){

                var ret = this.renderers[plugin];
                return ret;
            }
        }
        next();
    },
    testListRenderers:function(test){
        console.log('renderes', plugin.listRenderers());
        test.done();
    }
}