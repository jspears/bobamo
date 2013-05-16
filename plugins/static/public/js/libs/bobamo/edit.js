define([
    'jquery',
    'underscore',
    'Backbone',
    'Backbone.Form',
    'replacer',
    'libs/backbone-forms/templates/bootstrap',
    'backbone-modal',
    'libs/table/jquery.wiz'
], function ($, _, Backbone, Form, replacer) {
    "use strict";

    function nullEmptyStr(obj) {
        _(obj).each(function (v, k) {
            if (k == '_id' && _.isEmpty(v)) {
                delete obj[k];
            } else if (_.isString(v)) {

                obj[k] = _.isEmpty(v) ? null : v;
            }
            else if (_.isArray(v)) {
                obj[k] = _(v).filter(function (vv) {
                    if (_.isString(vv)) {
                        return !(_.isEmpty(vv));
                    } else if (vv) {
                        nullEmptyStr(vv);
                    }
                    return true;
                });

            }
            else if (_.isObject(v) && !_.isFunction(v)) {
                nullEmptyStr(v);
            }
        });

    }

    return Backbone.View.extend({
        tagName: 'div',
        events: {
//           'click button.save': 'onSave',
//            'click button.cancel': 'onCancel',
            'click ul.error-list li': 'onErrorItemClick'
//            'click .next': 'onNext',
//            'click .previous': 'onPrevious'
        },
        onNext: function (e) {
            if (e) e.preventDefault()
        },
        onPrevious: function (e) {
            if (e) e.preventDefault()

        },
        initialize: function () {
            _.bindAll(this);
        },
        onErrorItemClick: function (evt) {
            var d = $(evt.currentTarget).data();
            var $el = d['scroll-to'];
            if ($el) {
                //noinspection JSUnresolvedFunction
                $el.effect("bounce", { times: 3 }, 300);
            }
            this.focusStep(d.field);
        },
        focusStep: function (field) {
            if (this.isWizard) {
                _(this.fieldsets).find(function (v, k) {
                    if (v.fields.indexOf(field) > -1) {
                        $('.form-wrap', this.$el).wiz('step', k);
                        return true;
                    }
                    return false;
                }, this);
            }
        },

        onError: function (model, errors, stuff) {
            console.log('error', arguments);
            var $error = $('.error-list', this.$el);
            if (errors) {
                if (errors.responseText) {
                    errors = JSON.parse(errors.responseText);
                } else if (_.isString(errors.error)) {
                    $error.prepend($(replacer('<li><span class="alert-heading pointer">{error}</li>', errors)));
                }
                var fields = this.form.fields;
                var fField = null;
                _.each(errors.error && (errors.error.errors || errors.error) || errors, function (v, k) {
                    var path = v.path || k;
                    var field = fields[path];
                    if (field && field.$el)
                        field.$el.addClass('error');
                    var $e = $(
                        replacer('<li><span class="alert-heading pointer">"{path}" is in error: </span>{message}</li>', _.extend({path: path, message: v.message || v}, v))).data({'scroll-to': field && field.$el, field: path});
                    fField = path;
                    $error.prepend($e);
                }, this);
                if (fField)
                    this.focusStep(fField);
                $error.show('slow');
            }
            this.trigger('error', this, errors);
        },
        save: function (save) {
            var errors = this.form.commit();
            //       var errors;
            save = save || this.form.getValue();
            nullEmptyStr(save);
            //handle nested objects.
            _(save).each(function (v, k) {

                if (k && k.indexOf('.') > -1) {
                    var split = k.split('.');
                    var last = split.pop();
                    var obj = save;
                    _(split).each(function (kk) {
                        obj = _.isUndefined(obj[kk]) ? (obj[kk] = {}) : obj[kk];
                    });
                    obj[last] = v;
                    delete save[k];
                } else {
                    save[k] = v;
                }

            });
            if (!(errors)) {
                this.form.model.save(save, {error: this.onError});
            } else if (errors) {
                this.onError(this.form.model, errors);
            }

        },
        prepare: function () {

        },
        onSave: function (e) {
            if (e && e.preventDefault)
                e.preventDefault();
            $('.error-list', this.$el).empty().hide();
            $('.success-list', this.$el).empty().hide();
            console.log('changed', this.form.model.changed);
            //this.form.validate();
            //TODO - make sure to re-enable client side validation.
            this.save(this.prepare());
        },
        onSuccess: function (resp, obj) {
            var config = _.extend({}, obj.payload, this.config);
            this._changed = false;
            if (obj.error) {
                this.onError(resp, obj);
            } else {
                var $success = $('.success-list', this.$el).empty();
                this.$el.find('.error').removeClass('error');
                $success.append(
                    replacer('<li class="alert alert-success"><a class="close" data-dismiss="alert">?</a><h4 class="alert-heading">Success!</h4>Successfully Saved {title} [{_id}]</li>', config));
                $success.show('slow');
                this.trigger('save-success', this);
            }

        },
        onCancel: function () {
            var onSave = this.onSave, onCancel = this.doCancel;
            if (!this._changed){
                this.doCancel();
                return this;
            }
            require(['confirm_change'], function (Confirm) {
                var c = new Confirm();
                c.render('show', onSave, onCancel);

            });
            return this;
        },
        doCancel: function () {
            var listUrl = this.listUrl();
            if (listUrl)
            window.location.hash = listUrl;
        },
        listUrl:function(){
            if (this.config && this.config.modelName)
                return _.template('#/views/<%=modelName%>/list', this.config);
        },
        createModel: function (opts) {
            return new this.model(opts);
        },
        createForm: function (options) {
            return new Form(options);
        },
        wizOptions: {

        },
        btnTemplate: '<<%=type%> class="btn <%=clsNames%>" href="<%=href%>"><%if (iconCls){%><i class="<%=iconCls%>"></i><%}%><%=html%></<%=type%>>',
        /*<div class="btn-group pull-left">-->
         <!--<a class="btn cancel" href="#/views/${collection}/list"><b class="icon-list"/>List</a>-->
         <!--<button class="btn cancel">Cancel</button>-->
         <!--</div>-->*/
        buttons: {
            'left': [
                {
                    html: 'List',
                    iconCls: 'icon-list',
                    href:'<%=listUrl()%>',
                    type:'a'
                },

                {
                    html: 'Cancel',
                    clsNames: 'cancel',
                    type: 'button',
                    events: {
                        'click .cancel': 'onCancel'
                    }
                }
            ],
            'right': [
                {
                    html: 'Save',
                    clsNames: 'save btn-primary',
                    type: 'button',
                    events: {
                        'click .save': 'onSave'
                    }
                }
            ]
        },

        drawButtons: function (model) {
            var template = _.template(this.btnTemplate);
            model = model || this.model;
            var btns = model && model.buttons || this.buttons;
            if (!btns) {
                return
            }
            var $div =
                this.$el.find('.form-actions');
            if (!$div.length)
                $div = $('<div class="form-actions btn-toolbar"></div>');
            btns = _.isArray(btns) ? { right: btns } : btns;
            var events = this.events;
            _.each(btns, function (buttons, k) {
                buttons = _.isArray(buttons) ? buttons : [buttons];

                var $el = $div.find('.btn-group.pull-' + k);
                if (!$el.length) {
                    $el = $('<div class="btn-group pull-' + k + '">');
                    $div.append($el);
                }

                $.fn.append.apply($el, _.map(buttons, function (v) {
                    console.log('buttons', v);
                    if (_.isString(v)) {
                        return $(v);
                    } else {
                        var obj = _.extend({type: 'button', iconCls: '', html: 'Submit', clsNames: 'submit', href: window.location.hash}, v);
                        var str = _.template(template(obj),this);
                        var $a = $(str);
                        $a.data('data', v);
                        _.extend(events, v.events);
                        return $a;
                    }
                },this));
                //return $el;
            },this);
            this.delegateEvents(events);
//            var $clearfix = $div.find('.clearfix').remove();
//            if (!$clearfix.length) {
//                $clearfix = $('<div class="clearfix" style="clear:right"> </div>');
//            }

//            $div.append($clearfix);

            return $div;

        },
        createTemplate: _.template('<i class="icon-plus"></i>Create New <%=title%>'),
        editTemplate: _.template('<i class="icon-edit"></i> Edit <%=title%> [<%=id%>]'),
        doFormRender:function( id){
            var form = this.form, model = this.modelInstance;
            if (id) {
                model.fetch({success: _.bind(form.render, form)});
            } else {
                form.render();
            }

        },
        render: function (opts) {
            var $el = this.$el.html(this.template());
            var id = opts && (opts.id || opts._id);
            var model = this.modelInstance = this.createModel(opts);
            model.on('sync', this.onSuccess, this);
            var title = id ? this.editTemplate : this.createTemplate;
            var config = _.extend({id: id}, this.config);
            var form = this.form = this.createForm({
                model: model,
                fieldsets: this.fieldsets || model.fieldsets || [
                    {legend: title(config), fields: this.fields}
                ]
            });
            this._changed = false;
            form.on('change', function(){
                this._changed = true;
            },this)
            var $fm = $('.form-container', this.$el);
            var isWiz = _.isUndefined(this.isWizard) ? this.fieldsets && this.fieldsets.length > 1 : this.isWizard;
            var $del = this.$el;
            form.on('render', function () {
                var wizOptions = _.extend({replace: $('.save', $del)}, this.wizOptions);
                var html = form.el;
                console.log('appending', html);
                $fm.empty().append(html);
                if (isWiz)
                    $('.form-wrap', $del).wiz(wizOptions);
            }, this);
            this.doFormRender(id);
            this.drawButtons();
            $(opts && opts.container || this.options.container).html($el);
            return this;
        }
    });
})
;
