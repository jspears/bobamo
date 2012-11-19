define(['Backbone', 'Backbone.Form',  'underscore', 'jquery',  'backbone-modal', 'libs/jquery/jquery.ba-farthest-descendant'], function(Backbone, Form,_,$, BootstrapModal ){
   var EBootstrapModal = BootstrapModal.extend({
        render:function onEnchancedBootstrapRender(o) {
            var render =  BootstrapModal.prototype.render;
            var args =  Array.prototype.slice.call(arguments, 0);
            console.log('this', typeof this, 'render', typeof render);
            render.apply(this, args);
            var $wiz = this.$el.find('.modal-body');
            if ($wiz.wiz) $wiz.wiz({stepKey:'_propStep', clsNames:'', replace:$('a.ok', this.$el), fieldset:'> form.form-horizontal > fieldset'});
            this.$el.find('.cancel').addClass('pull-left');
            //TODO - seriously find a better way to fix nestedforms so that this is not necessary.
//            $wiz.find('> form.form-horizontal > fieldset').furthestDecendant('.controls').css({marginLeft:'160px'})
//                    .siblings('label').css({display:'block'}).parent().parent().parent().parent().parent().css({marginLeft:0}).siblings('label').css({display:'none'})
//                    .parent().parent().parent().parent().parent().css({marginLeft:0}).siblings('label').css({display:'none'});
            $wiz.find('> form.form-horizontal > fieldset').furthestDecendant('.controls').css({marginLeft:'160px'})
                    .siblings('label').css({display:'block'}).parents('.controls').css({marginLeft:0}).siblings('label').css({display:'none'});

             //       .parent().parent().parent().parent().parent().css({marginLeft:0}).siblings('label').css({display:'none'});

            console.log('furthest', this.$el.furthestDecendant('.controls'))//.style({marginLeft:'160px', border:'1px solid red'});
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
