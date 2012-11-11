define(['text'], function(text){

    var jsonParse = (typeof JSON !== 'undefined' && typeof JSON.parse === 'function')? JSON.parse : function(val){
            return eval('('+ val +')'); //quick and dirty
        },
        buildMap = {};

    //API
    return {

        load : function(name, req, onLoad, config) {
            text.get(req.toUrl(name), function(data){
                if (config.isBuild) {
                    buildMap[name] = data;
                    onLoad(data);
                } else {
                    onLoad(jsonParse(data));
                }
            });
        },

        //write method based on RequireJS official text plugin by James Burke
        //https://github.com/jrburke/requirejs/blob/master/text.js
        write : function(pluginName, moduleName, write){
            if(moduleName in buildMap){
                var content = buildMap[moduleName];
                write('define("'+ pluginName +'!'+ moduleName +'", function(){ return '+ content +';});\n');
            }
        }

    };
});