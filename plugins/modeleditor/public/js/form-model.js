define(['Backbone', 'Backbone.Form',  'underscore', 'jquery',  'backbone-modal', 'libs/jquery/jquery.ba-farthest-descendant'], function(Backbone, Form,_,$, BootstrapModal ){
   var EBootstrapModal = BootstrapModal.extend({
        constructor:function(options){
            if (options && options.content && options.content.title)
                options.title = options.content.title;

            BootstrapModal.prototype.constructor.apply(this, _.toArray(arguments));
            return this;
        },
        render:function onEnchancedBootstrapRender(o) {
            var render =  BootstrapModal.prototype.render;
            var args =  Array.prototype.slice.call(arguments, 0);

            render.apply(this, args);
            var $wiz = this.$el.find('.modal-body');
//            var title = this.options.content && this.options.content.title || '';
            if ($wiz.wiz) $wiz.wiz({stepKey:'_propStep', clsNames:'',  steps:'Step {current} of {steps}', replace:$('a.ok', this.$el), fieldset:'> form.form-horizontal > fieldset'});
            this.$el.find('.cancel').addClass('pull-left');
            //TODO - seriously find a better way to fix nestedforms so that this is not necessary.
            $wiz.find('> form.form-horizontal > fieldset').furthestDecendant('.controls').css({marginLeft:'160px'})
                    .siblings('label').css({display:'block'}).parents('.controls').css({marginLeft:0}).siblings('label').css({display:'none'});
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
