define(['Backbone', 'underscore', 'jquery','backbone-modal', 'text!tpl/confirm_change.html'], function(Backbone, _, $, Modal, template){
    var ConfirmView = Backbone.View.extend({
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
            this.$modal.modal('hide');
            if (this.cancelCallback)
                this.cancelCallback();
            else
                window.history.back();
        },
        render:function(modal, callback, cancel, data){
            if (!$.contains(document.body, this.$el[0]))
            $('body').append(this.$el);
            this.callback = callback;
            this.cancelCallback = cancel;
            var fill = _.extend({}, data, this.defaults, this.options.defaults );
            this.$modal = $(this.template(fill));
            $(this.el).append(this.$modal)
            this.$modal.modal(modal);
            this.$modal.on('hidden', function(){  $(this).remove(); })
            return this;
        }
    })
    return ConfirmView;
});