define(['Backbone', 'underscore', 'jquery', 'text!tpl/confirm_change.html', 'libs/bootstrap/js/bootstrap-modal'], function(Backbone, _, $, template){
    var ConfirmView = Backbone.View.extend({
        el:'body',
        template:_.template(template),
        initialize:function(){
            _.bindAll(this);
        },

        events:{
            'click .btn-primary':'onSave',
            'click .btn.cancel':'onCancel'
        },
        onSave:function(){
            this.$modal.modal('hide');
            if (this.callback){
                this.callback();
            }
        },
        onCancel:function(){
            console.log('onCancel');
            if (this.cancelCallback)
                this.cancelCallback();
        },
        render:function(modal, callback, cancel, data){
            this.callback = callback;
            this.cancelCallback = cancel;
            var fill = _.extend({body:'You made changes do you want to save them?', button:'Save Change', title:'Unsaved Changes'}, data)
            this.$modal = $(this.template(fill));
            $(this.el).append(this.$modal)
            this.$modal.modal(modal);
        }
    })
    return ConfirmView;
});