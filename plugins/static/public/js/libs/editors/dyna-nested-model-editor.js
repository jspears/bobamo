define(['underscore', 'Backbone', 'Backbone.Form'], function (_, B, Form) {

    var editors = Form.editors;
    var DynaNestedModel = editors['DynaNestedModel' ] = editors.Text.extend({
        initialize: function (options) {
            editors.Text.prototype.initialize.call(this, options);
        },
        setValue: function (value) {
            this.value = value;
            this.render(this.value);
        },
        render: function (renderer) {
            var form = this.form;
            var key = this.key;
            var self = this;
            renderer = renderer || this.schema.renderer;
            if (renderer) {
                require([renderer], function (Model) {
                    var fields = form.fields, config = fields && fields[key];
                    var $el = self.$el;
                     Model = Model.prototype.schema ? Model : Model.prototype.model && Model.prototype.model;
                    console.log('render schema '+renderer, Model.prototype.schema);
                    //config.editor.remove();
                    var configModel = new editors.NestedModel({schema: {model: Model}, key: key, idPrefix: renderer}).render();
                    $el.replaceWith(configModel.el);
                    if (config)
                        config.editor = configModel;

                });
            }
            return this;
        }

    });
    return DynaNestedModel

});