define(['Backbone.Form', 'underscore', 'jquery'], function (Form, _, $) {

    var editors = Form.editors;
    var unitRe = /(\(.*\))?([\d\.]+?)?(px|%|em|in|cm|mm|ex|pt|pc|px)?$/;
    var units = ['px', '%', 'em', 'in', 'cm', 'mm', 'ex', 'pt', 'pc', 'px', '\u0192'];
    var UnitEditor = editors.UnitEditor = editors.Base.extend({

        tagName:'div',
        className:'input-append',
        defaultValue:'',

        initialize:function (options) {
            editors.Base.prototype.initialize.call(this, options);

            //Allow customising text type (email, phone etc.) for HTML5 browsers
            var type = 'color';
            this.$input = $('<input type="text">')
            this.$select = $('<span class="add-on"></span>')
            this.$el.append(this.$input, this.$select);
            var placeholder = this.schema && this.schema.placeholder;
            if (placeholder) {
                var res = unitRe.exec(placeholder);

                if (res) {
                    if (res[1]) {
                        this.$select.html('\u0192');
                        placeholder = res[1];
                    } else {
                        placeholder = res[2];
                        this.$select.html(res[3]);
                    }
                    this.$input.attr('placeholder', placeholder);
                }
            }

        },

        /**
         * Adds the editor to the DOM
         */
        render:function () {
            this.setValue(this.value);

            return this;
        },

        /**
         * Returns the current editor value
         * @return {String}
         */
        getValue:function () {
            //exec[1] == 'formula'
            //exec[2] == size
            //exec[3] == unit
            var val = this.$input.val();
            if (val) {
                if (this.$select.text() == '\u0192') {
                    return '(' + val + ')';
                } else
                    val += this.$select.text();
            }
            return val;
        },

        /**
         * Sets the value of the form element
         * @param {String}
            */
        setValue:function (value) {
            var res = unitRe.exec(value);

            if (res) {
                if (res[1]) {
                    this.$select.html('\u0192');
                    this.$input.val(res[1]);
                } else {
                    this.$input.val(res[2]);
                    this.$select.html(res[3]);
                }
            } else
                this.$input.val(value);
        }
    });
    return UnitEditor;
});
