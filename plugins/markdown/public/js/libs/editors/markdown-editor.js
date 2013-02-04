define(['Backbone.Form', 'markdown/settings', 'markdown/js/libs/editors/markitup/markitup/jquery.markitup'], function(Form, settings){

    var Markdown = Form.editors.TextArea.extend({
        tagName:'textarea',
        getValue:function(){
          return this.$el  ? this.$el.val()  : this.value;
        },
        setValue:function(value){
            this.$el.val(value);
          this.value = value;
        },
        render:function(){
            var self = this;
            this.$el.attr('rows','20');
            this.$el.attr('cols','80')

            this.$el.markItUp(settings);
            return this;
        }
    })

    return Markdown;

})