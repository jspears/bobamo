var bobamo = require('../../index'),
    _ = require('underscore'),
    PluginApi = bobamo.PluginApi, util=require('util'), DisplayModel = bobamo.DisplayModel;
var levels = 'all log error info warn off'.split(' ');
var lmap = {};
levels.each(function(v,i){
    lmap[v] = i;
});

var LoggingPlugin = function(){
    PluginApi.apply(this, arguments);
    var conf = this.conf = {
        logging:'all'
    }

    function level(level){
        return function(mesg){
            var l = conf[this.name];
            if (l == 'off')
                return this;
            if (l == level || lmap[l] >= lmap[level])
               console.log.apply(console, [this.name+': '+level].concat(Array.prototype.call(arguments,0)));
            return this;
        }.bind(this);
    }
    PluginApi.prototype.log = function(mesg){
        var name = this.name;
        if (mesg){
            console.log(this.name+':', mesg);
            return this;
        }else{
            return function (mesg){
                if (mesg){
                    this.log(mesg);
                    return this;
                }
                this.log = level('log');
                this.warn = level('warn');
                this.error = level('error');
                this.info = level('info');
                return this;
            }.bind(this);

        }
    }
}

util.inherits(LoggingPlugin, PluginApi);
LoggingPlugin.prototype.admin = function(){
    var defaults = _.extend( {logging:'all'}, this.conf);
    var schema = {
        logging:{
            type:'Select',
            title:'Global Logging',
            options:levels
        }
    }
    var order = ['logging'];
    this.pluginManager.forEach(function(plugin){
        if (plugin == this)
            return;
        order.push(plugin.name);
        schema[plugin.name] = {
            type:'Select',
            options:levels
        }
        if (!defaults[plugin.name])
            schema[plugin.name] = defaults.global;
    }, this);
    return new DisplayModel('logging', {
        schema:schema,
        fieldsets:[{
            legend:'Logging',
            fields:order
        }],
        defaults:defaults
    })
}
module.exports = LogginPlugin;