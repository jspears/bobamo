define(['Backbone', 'Backbone.Form',  'underscore', 'jquery',  'backbone-modal'], function(Backbone, Form,_,$, BootstrapModal ){
   var EBootstrapModal = BootstrapModal.extend({
        render:function onEnchancedBootstrapRender(o) {
            var render =  BootstrapModal.prototype.render;
            var args =  Array.prototype.slice.call(arguments, 0);
            console.log('this', typeof this, 'render', typeof render);
            render.apply(this, args);
            var $wiz = this.$el.find('.modal-body');
            if ($wiz.wiz) $wiz.wiz({stepKey:'_propStep', clsNames:'', replace:$('a.ok', this.$el), fieldset:'> form > fieldset'});
            this.$el.find('.cancel').addClass('pull-left');
            return this;
        }
    });


    var EForm = Backbone.Form.extend({
        render:function onEnhancedFormRender(){
            var render =  Backbone.Form.prototype.render;
            var args = Array.prototype.slice.call(arguments,0);
            render.apply(this, args);
            this.trigger('render');
            return this;
        }
    })
    EForm.editors.List.Modal.ModalAdapter =  EBootstrapModal
    return EForm;
});
