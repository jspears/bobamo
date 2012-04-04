define(['Backbone.Form', 'jquery'], function (Form, $) {
    /*
     <div class="input-prepend">
     <span class="add-on">@</span>
     <input class="span2" id="prependedInput" size="16" type="text">
     </div>
     */
    var Prepend  = Form.editors.Prepend = Form.editors.Base.extend({

        tagName:'div',
        defaultValue:'',
        classNames:'input-prepend',
        prepend:'@',
        initialize:function (options) {
            editors.Base.prototype.initialize.call(this, options);
        },
        /*
         * Adds the editor to the DOM
         */
        render:function () {
            this.append('<span class="add-on">'+this.prepend+'</span>');
            this.append((this.$input = $('<input type="text" class="span2">')));
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
            this.value = value;
            if (this.$input) {
                this.$input.val(value);
            }
        }

    });
    return Prepend;

});