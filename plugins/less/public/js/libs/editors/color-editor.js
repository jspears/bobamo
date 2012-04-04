define(['Backbone.Form', 'underscore', 'jquery', 'libs/jquery-miniColors/jquery.miniColors'], function (Form, _, $) {

    var editors = Form.editors;
    var color = /^(#|darken\(|lighten\(|rgb\(|rgba\(|hsl\(|hsla\()([^)]*)/;
    var rgbRe = /rgb\((\d+), (\d+), (\d+)\)/;
    var hexRe = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;

    function hexToRgb(hex) {
        var result = hexRe.exec(hex);
        return result ? {
            r:parseInt(result[1], 16),
            g:parseInt(result[2], 16),
            b:parseInt(result[3], 16)
        } : null;
    }

    function parseRgb(rgb) {
        var res = rgbRe.exec(rgb);
        if (res) {
            return {
                r:parseInt(res[1], 10),
                g:parseInt(res[2], 10),
                b:parseInt(res[3], 10)
            }
        }
    }

    function asRgb(str) {
        if (!str) return;
        if (hexRe.test(str)) {
            return hexToRgb(str);
        } else if (rgbRe.test(str)) {
            return parseRgb(str);
        }
    }

    var ColorEditor = editors.ColorEditor = editors.Base.extend({

        tagName:'div',
        className:'input-append',
        defaultValue:'',
        event:{
          'change input':'contrast'
        },
        contrast:function () {
            var color = asRgb(this.$a.css('backgroundColor'));
            if (color) {
                var brightness = (color.r * 299 + color.g * 587 + color.b * 114) / 1000;
                var white = !(brightness > 125);
                this.$a.css({'color': white ? '#fff' :'#000', 'textShadow': '0 1px 0'+(white ? '#000' :'#ccc')})
            }

        },
        initialize:function (options) {
            editors.Base.prototype.initialize.call(this, options);

            //Allow customising text type (email, phone etc.) for HTML5 browsers
            var type = 'color';
            this.$input = $('<input type="text">')
            var placeholder = this.schema && this.schema.placeholder;
            this.$el.append(this.$input);
            this.$input.miniColors();
            if (placeholder) {
                this.$input.attr('placeholder', placeholder);
                if (placeholder[0] == '#') {
                    this.$input.miniColors('value', placeholder);
                }
            }
            this.$a = $('a', this.$el).addClass('add-on').html('\u2318');

            this.contrast();
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
            return this.$input.val();
        },

        /**
         * Sets the value of the form element
         * @param {String}
            */
        setValue:function (value) {
            if (value && /^#/.test(value)) {
                this.$input.miniColors('value', value);
            }
            this.contrast();
            this.$input.val(value);
        }
    });
    return ColorEditor;
});
