define(['Backbone', 'Backbone.Form', 'underscore', 'jquery', 'backbone-modal', 'libs/jquery/jquery.ba-farthest-descendant'], function (Backbone, Form, _, $, BootstrapModal) {
    var renderBootstrapModal = BootstrapModal.prototype.render;

    var EBootstrapModal = BootstrapModal.extend({
        constructor:function (options) {
            if (options && options.content && options.content.title)
                options.title = options.content.title;

            BootstrapModal.prototype.constructor.apply(this, _.toArray(arguments));
            return this;
        },
        render:function onEnchancedBootstrapRender(o) {
            renderBootstrapModal.apply(this, _.toArray(arguments));
            var $wiz = this.$el.find('.modal-body');
            if ($wiz.wiz)
                $wiz.wiz({stepKey:'_propStep', clsNames:'', steps:'Step {current} of {steps}', replace:$('a.ok', this.$el), fieldset:'> form.form-horizontal > fieldset'});

            this.$el.find('.cancel').addClass('pull-left');
            //TODO - seriously find a better way to fix nestedforms so that this is not necessary.
            $wiz.find('> form.form-horizontal > fieldset').furthestDecendant('.controls').css({marginLeft:'160px'})
                .siblings('label').css({display:'block'}).parents('.controls').css({marginLeft:0}).siblings('label').css({display:'none'});
            return this;
        }
    });


    var render = Backbone.Form.prototype.render;
    var SchemaForm = Backbone.Form.extend({
        render:function onEnhancedFormRender() {
            render.apply(this, _.toArray(arguments)).trigger('render');
            return this;
        }
    })
    var editors = Form.editors;

    var List = editors.List;

    var Orig = editors.NestedModel;

    editors.NestedModel =   Orig.extend({
        constructor:function(){
            Orig.prototype.constructor.apply(this, _.toArray(arguments));
            return this;
        },
        render: function() {
            var data = this.value || {},
                key = this.key,
                nestedModel = this.schema.model;

            //Wrap the data in a model if it isn't already a model instance
            var modelInstance = (data.constructor === nestedModel) ? data : new nestedModel(data);
            var opts = {
                model: modelInstance,
                idPrefix: this.id + '_',
                fieldTemplate: 'nestedField',
                pform:this.form
            }
            if (modelInstance && _.isFunction(modelInstance.createForm)){
                   this.form =  modelInstance.createForm(opts);
            }else{
                this.form = new SchemaForm(opts);
            }
            this._observeFormEvents();

            //Render form
            this.$el.html(this.form.render().el);

            if (this.hasFocus) this.trigger('blur', this);

            return this;
        }
    });
    SchemaForm.editors.List.Modal.ModalAdapter = EBootstrapModal
    return SchemaForm;
});
