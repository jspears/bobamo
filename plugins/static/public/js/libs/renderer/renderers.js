define(['jquery'], function ($) {
    var id = 0;
    var Renderer = function (config) {
        this.config = config || {};
    }
    define('renderer/Text', function(){
        return function(value){
            this.$el.html(value);
        }
    });
//    define('renderer/Number', function(){
//        return function(value){
//            this.$el.html(value);
//        }
//    });
    define('renderer/default', function(){
       return function(value){
           this.$el.html(value);
       }
    });
    Renderer.prototype.add = function(obj){
            if (obj && obj.property)
               this.config[obj.property] = obj;
    };
    Renderer.prototype.render = function ( value, property, model, options) {
        var conf = this.config[property];
        var type = conf ? conf.renderer :  'default'
        var nodeId = 'render-'+type+'-'+property+"-"+(id++);
        require(['renderer/'+type], function(render){
            render.apply({
                id:nodeId,
                $el:$('#'+nodeId),
                property:property,
                options:options
            }, [value]);
        });
        return '<div id="'+nodeId+'"></div>';
    }
    return Renderer;
});