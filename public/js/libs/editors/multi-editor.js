define(['Backbone.Form', 'jquery'], function(Form,  $){
    var editors = Form.editors;
    var MultiEditor = editors.MultiEditor = editors.Select.extend({
        attributes:{multiple:'multiple'},
        setValue: function(value) {
            if (value)
                $('option', this.el).each(function(k,v) {
                    var $v = $(v);
                    if (value && value.indexOf($v.val()) > -1)
                        $v.attr('selected', 'selected');
                });
            this.value = value;
        }
    });
    return MultiEditor;

});