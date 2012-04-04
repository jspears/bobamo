define(['Backbone', 'underscore', 'jquery', 'text!tpl/confirm_change.html', 'libs/bootstrap/js/bootstrap-modal'], function(Backbone, _, $, template){
    var ConfirmView = Backbone.View.extend({
        el:'body',
        defaults:{
            body:'You made changes do you want to save them?',
            button:'Save Change',
            title:'Unsaved Changes'
        },
        template:_.template(template),
        initialize:function(){
            _.bindAll(this);
            this._hide = this.hide;
            this.hide = $.proxy(function(){
                this._hide();
                $(this.el).remove(this.$modal);
            },this);
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
            var fill = _.extend({}, data, this.defaults, this.options.defaults );
            this.$modal = $(this.template(fill));
            $(this.el).append(this.$modal)
            this.$modal.modal(modal);
            this.$modal.on('hidden', function(){  $(this).remove(); })
        }
    })
    return ConfirmView;
});