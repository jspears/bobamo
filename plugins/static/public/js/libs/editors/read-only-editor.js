define(['underscore', 'Backbone.Form'], function (_, Form) {
    var noop = function(){};
    var Base = Form.editors.Base;
    return Form.editors.ReadOnly = Base.extend({
        tagName:'span',
        template: Form.helpers.createTemplate('{{value}}'),
        initialize: function (options) {
            Base.prototype.initialize.call(this, options);
            var template = options.template;
            if (template)
                this.template = _.isString(template) ? _.template(template) : template;
        },
        render: function () {
            this.$el.html(this.template({value:this.value, form:this.form}));
            return this;
        },
        setValue: function (value) {
            this.value = value;
            this.render();
        },
        getValue: function () {
            return this.value;
        },

        focus: noop,
        blur:noop,
        validate:noop

    });


});