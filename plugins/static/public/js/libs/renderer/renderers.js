define(['jquery'], function ($) {
    var id = 0;
    var Renderer = function (config) {
        this.config = config || {};
    }

    define('renderer/default', function () {
        return function () {
            return function (value) {
                this.$el.html(value);
            }
        }
    });
    Renderer.prototype.add = function (obj) {
        if (obj && obj.property)
            this.config[obj.property] = obj;
    };
    var re = /\./g;
    Renderer.prototype.render = function (value, property, model, options) {
        var conf = this.config[property];
        var type = conf ? conf.renderer : 'default'
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