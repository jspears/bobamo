define([
    'jquery',
    'underscore',
    'Backbone',
    'Backbone.Form',
    'replacer',
    'libs/backbone-forms/src/templates/bootstrap',
    'jquery-ui',
    'libs/table/jquery.wiz'
], function ($, _, Backbone, Form, replacer) {
    "use strict";
    function nullEmptyStr(obj){
        _(obj).each(function(v,k){
           if (k == '_id' && _.isEmpty(v) ){
               delete obj[k];
           }else if (_.isString(v) ){

               obj[k] = _.isEmpty(v) ? null : v;
           }
           else if (_.isArray(v)){
               obj[k] = _(v).filter(function(vv){
                  if(_.isString(vv)){
                     return !(_.isEmpty(vv));
                  }else if (vv){
                    nullEmptyStr(vv);
                  }
                  return true;
               });

           }
           else if (_.isObject(v) &! _.isFunction(v)){
               nullEmptyStr(v);
           }
        });

    }
    var EditView = Backbone.View.extend({
        tagName:'div',
        events:{
            'click button.save':'onSave',
            'click button.cancel':'onCancel',
            'click ul.error-list li':'onErrorItemClick',
            'submit form':'onSave'
        },
        initialize:function () {
            _.bindAll(this);
        },
        onErrorItemClick:function (evt) {
            var d = $(evt.currentTarget).data();
            var $el = d['scroll-to']
            $el.effect("bounce", { times:3 }, 300);
            this.focusStep(d.field);
        },
        focusStep:function(field){
            if (this.isWiz){
                _(this.fieldsets).find(function(v,k){
                    if (v.fields.indexOf(field) > -1){
                        $('.form-wrap', this.$el).wiz('step', k);
                        return true;
                    }
                }, this);
            }
        },

        onError:function (model, errors, stuff) {
            console.log('error', arguments);
            var $error = $('.error-list', this.$el);
            if (errors) {
                if (errors.responseText) {
                    errors = JSON.parse(errors.responseText);
                }else if (_.isString(errors.error)){
                    $error.prepend( $(replacer('<li><span class="alert-heading pointer">{error}</li>',errors)));
                }
                var fields = this.form.fields;
                var fField;
                _.each(errors.error.errors, function (v, k) {
                    var field = fields[v.path];
                    if (field && field.$el)
                        field.$el.addClass('error');
                    var $e = $(
                        replacer('<li><span class="alert-heading pointer">"{path}" is in error: </span>{message}</li>',v)).data({'scroll-to': field.$el, field:v.path});
                    fField = v.path
                    $error.prepend($e);
                }, this);
                this.focusStep(fField);
                $error.show('slow');
            }
        },

        onSave:function (e) {
            e.preventDefault();
            $('.error-list').empty().hide();
            $('.success-list').empty().hide();
            console.log('changed', this.form.model.changed);
            this.form.validate();
            var errors = this.form.commit();

            var save = this.form.getValue();
            nullEmptyStr(save);
            //handle nested objects.
            _(save).each(function (v, k) {

                if (k && k.indexOf('.') > -1) {
                    var split = k.split('.');
                    var last = split.pop();
                    var obj = save;
                    _(split).each(function (kk, vv) {
                        obj = (obj[kk] = {});
                    });
                    obj[last] = v;
                    delete save[k];
                }else{
                    save[k] =v;
                }

            });
            if (!errors) {
                this.form.model.save(save, {error:this.onError});
            } else {
                this.onError(this.form.model, errors);
            }

        },
        onSuccess:function (resp, obj) {
            var config = _.extend({}, obj.payload, this.config);
            if (obj.error) {
                this.onError(resp, obj);
            } else {
                var $success = $('.success-list', this.$el).empty();
                $success.append(
                    replacer('<li class="alert alert-success"><a class="close" data-dismiss="alert">×</a><h4 class="alert-heading">Success!</h4>Successfully Saved {title} [{_id}]</li>', config));
                $success.show('slow');
            }

        },
        onCancel:function () {
            var onSave = this.onSave, onCancel = this.doCancel;
            require(['confirm_change'], function (Confirm) {
                var c = new Confirm();
                c.render('show', onSave, onCancel);

            })
            return this;
        },
        doCancel:function () {
             window.location.hash = replacer('#/{modelName}/list', this.config);
        },
        createModel:function(opts){
          return new this.model(opts);
        },
        render:function (opts) {
            var $el = this.$el.empty().append(this.template());
            var id = opts && (opts.id || opts._id);
            var model = this.createModel(opts);
            model.on('sync', this.onSuccess, this);
            var title = id ? '<i class="icon-edit"></i> Edit {title} [{id}]' : '<i class="icon-plus"></i>Create New {title}';
            var config = _.extend({id:id}, this.config);
            var form = this.form = new Form({
                model:model,
                fieldsets:this.fieldsets || [
                    {legend:replacer(title, config), fields:this.fields}
                ]
            });
            var $fm = $('.form-container', this.$el);
            var isWiz = _.isUndefined(this.isWizard) ? this.fieldsets.length > 1 : this.isWizard;
            var $del = this.$el;
            if (id) {
                model.fetch({success:function () {
                    $fm.append(form.render().el);
                    if (isWiz)
                        $('.form-wrap', $del).wiz({replace:$('.save', $del)});
                }});
            } else {
                $fm.append(form.render().el);
                if (isWiz)
                    $('.form-wrap',$del).wiz({replace:$('.save', $del)});
            }
            $(this.options.container).empty().append($el);
            return this;
        }
    });
    return EditView;
});
