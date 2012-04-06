define(['Backbone.Form', 'jquery'], function (Form,  $) {

    var editors = Form.editors;
    var PlaceholderEditor = editors.PlaceholderEditor = editors.Text.extend({
        initialize:function (options) {
            editors.Text.prototype.initialize.call(this, options);
            var placeholder = this.schema && this.schema.placeholder;
            if (placeholder) {
                this.$el.attr('placeholder', placeholder);
            }

        }
    });
    return PlaceholderEditor;
});
