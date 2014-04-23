define(['jquery'], function ($) {
    var id = 0;
    var Renderer = function (config) {
        this.config = [];
    }

    define('renderer/default', function () {
        return function () {
            return function (value) {
                this.$el.html(value);
            }
        }
    });
    Renderer.prototype.add = function (obj) {
        if (obj)
        this.config.push(obj);
    };
    var re = /\./g;
    Renderer.prototype.render = function (value, property, model, idx, options) {
        var conf = this.config[idx];
        var type = conf && conf.renderer ? conf.renderer : 'default'
        options = conf ? conf.config  : options;
        var nodeId = 'render-' + type.replace(re, '_') + '-' + property.replace(re, '_') + "-" + (id++);
        require(['renderer/' + type], function (render) {
            render(options).apply({
                id: nodeId,
                $el: $('#' + nodeId),
                property: property,
                options: options
            }, [value, property, model]);
        });
        return '<div id="' + nodeId + '"></div>';
    }
    return Renderer;
});