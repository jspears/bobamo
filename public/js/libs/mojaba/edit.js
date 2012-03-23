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

    var EditView = Backbone.View.extend({
        tagName:'div',
        events:{
            'click button.save':'onSave',
            'click button.cancel':'onCancel',
            'click ul.error-list li':'onErrorItemClick'
        },
        initialize:function () {
            _.bindAll(this);
        },
        onErrorItemClick:function (evt) {
            var $el = $(evt.currentTarget).data('scroll-to')
            $el.effect("bounce", { times:3 }, 300);

        },
        onError:function (model, errors, stuff) {
            console.log('error', arguments);
            var $error = $('.error-list', this.$el);
            if (errors) {
                if (errors.responseText) {
                    errors = JSON.parse(errors.responseText);
                }
                var fields = this.form.fields;
                _.each(errors.error.errors, function (v, k) {
                    var field = fields[v.path];
                    if (field && field.$el)
                        field.$el.addClass('error');
                    var $e = $(
                        replacer('<li><span class="alert-heading pointer">"{path}" is in error: </span>{message}</li>',v)).data('scroll-to', field.$el);
                    $error.prepend($e);
                }, this);
                $error.show('slow');
            }
        },

        onSave:function () {
            $('.error-list').empty().hide();
            $('.success-list').empty().hide();
            this.form.validate();
            var errors = this.form.commit();

            var save = this.form.getValue();
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
                }
            });
            if (!errors) {
                this.form.model.save(save, {success:this.onSuccess, error:this.onError});
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
        render:function (opts) {
            var $el = this.$el.empty().append(this.template());
            var id = opts && (opts.id || opts._id);
            var model = new this.model(opts);
            var title = id ? '<i class="icon-edit"></i> Edit {title} [{id}]' : '<i class="icon-plus"></i>Create New {title}';
            var config = _.extend({id:id}, this.config);
            var form = this.form = new Form({
                model:model,
                fieldsets:this.fieldsets || [
                    {legend:replacer(title, config), fields:this.fields}
                ]
            });
            var $fm = $('.form-container', this.$el);
            var isWiz = this.fieldsets.length > 1;
            if (id) {
                model.fetch({success:function () {
                    $fm.append(form.render().el);
                }});
            } else {
                $fm.append(form.render().el);
                if (isWiz)
                    $fm.wiz();
            }
            $(this.options.container).empty().append($el);
            return this;
        }
    });
    return EditView;
});
