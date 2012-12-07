define(['Backbone.Form', 'jquery', 'underscore'], function (Form, $, _) {
    var editors = Form.editors;
    var MultiEditor = editors.MultiEditor = editors.Select.extend({
        initialize:function (options) {
            editors.Select.prototype.initialize.apply(this, _.toArray(arguments));
            if (this.schema && ( this.schema.multiple  !== false || this.schema.schemaType == 'Array' || this.schema.type == 'Array' )){
                this.$el.attr('multiple', 'multiple');
                this._multiple = true;
            }
            return this;
        },
        setValue:function (value) {
            if (value)
                $('option', this.el).each(function (k, v) {
                    var $v = $(v);
                    if (value && value.indexOf($v.val()) > -1)
                        $v.attr('selected', 'selected');
                });
            this.value = value;
        },
        selectNone:'<option data-none="null" value="">None</option>',
        renderOptions:function (options) {
            var $select = this.$el,
                html = '';
            var soptions = this.schema.options;
            if (!(soptions && soptions.required )) {
              html += soptions && soptions.selectNone || this.selectNone;
            }
            //Accept string of HTML
            if (_.isString(options)) {
                html += options;
            }

            //Or array
            else if (_.isArray(options)) {
                html += this._arrayToHtml(options);
            }

            //Or Backbone collection
            else if (options instanceof Backbone.Collection) {
                html += this._collectionToHtml(options)
            }

            //Insert options
            $select.html(html);

            //Select correct option
            this.setValue(this.value);
        },
        getValue:function(){
            var $children =this.$el.children();
            for(var i=0,l=$children.length; i<l; i++){
                if($children[i].selected && $($children[i]).attr('data-none') == 'null'){
                    return null;
                }
            }
            return this.$el.val();

        }
    });
    return MultiEditor;

});