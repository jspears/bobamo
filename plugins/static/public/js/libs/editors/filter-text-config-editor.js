define(['Backbone.Form', 'underscore'], function (Form, _) {
    "use strict";
    var editors = Form.editors;
    var Base = editors.Base;
    var reFilter = /^\/|\/$/g;
    var FilterTextConfigEditor = editors.FilterTextConfigEditor = editors.FilterTextConfig = Base.extend({
        events:_.extend({}, Base.prototype.events, {'change input':'onKeyPress'}),
        tagType:'div',
        getValue:function () {
            return this.$val.val();
        },
        setValue:function (value) {
            this.$val.val(value);
        },
        initialize:function (options) {
            Base.prototype.initialize.call(this, options);
            this.$val = $('<input type="text">');
        },
        onKeyPress:function (e) {
            var val = this.$val.val();
            val = val && val.replace(reFilter, '');
            if (!(val || this.$test.val()))
                return;
            //Get the whole new value so that we can prevent things like double decimals points etc.
            var newVal = this.$test.val();
            try {
                var re = new RegExp(val);
            } catch (e) {
                this.$check.removeClass('alert-info alert-success').addClass('alert-error')
                this.$check.html(e.message);
                return;
            }

            if (re.test(newVal)) {
                this.$check.removeClass('alert-info alert-error').addClass('alert-success')
                this.$check.html("Passed validation");

            } else {
                this.$check.removeClass('alert-error alert-success').addClass('alert-info')
                this.$check.html("Did not pass validation, this may be correct behaviour");
            }

        },
        focus:function () {
            if (this.hasFocus) return;

            this.$val.focus();
        },

        blur:function () {
            if (!this.hasFocus) return;

            this.$val.blur();
        },
        determineChange:function (event) {
            var currentValue = this.$val.val();
            var changed = (currentValue !== this.previousValue);

            if (changed) {
                this.previousValue = currentValue;

                this.trigger('change', this);
            }
        },
        render:function () {
            this.$val = $('<input type="text">');
//
            this.$test = $('<input type="text" class="checkregexp" placeholder="Test Regexp against">');
            this.$check = $('<div class="check alert">&nbsp;</div>')
            var $el = this.$el;
            $el.append(this.$val);
            //   this.$el.append(this.$val);

            $el.append(this.$test);
            //          $el.append('<div></div>')
            $el.append(this.$check);
            //console.log('html', $el.html());

            return this;
        }
    });
    return FilterTextConfigEditor;

})