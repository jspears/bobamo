define([
    'jquery',
    'underscore',
    'Backbone',
    'Backbone.Form',

    'collections/${schema.modelName}',
    'models/${schema.modelName}',
    'text!templates/${schema.modelName}/edit.html',
    'libs/backbone-forms/src/templates/bootstrap',
    'jquery-ui'
].concat({{html _editors(false)}}), function ($, _, Backbone, Form, collection, Model, template) {
    var fields = {{html JSON.stringify(schema.edit_fields) }};
var EditView = Backbone.View.extend({
  //  el:'#content',
    tagName:'div',
    template:_.template(template),
    events:{
        'click button.save':'onSave',
        'click button.cancel':'onCancel',
        'click ul.error-list li':'onErrorItemClick'
    },
    initialize:function () {
        _.bindAll(this);
    },
    onErrorItemClick:function(evt){
        var $el = $(evt.currentTarget).data('scroll-to')
        $el.effect("bounce", { times:3 }, 300);
//        $('html, body').animate({
//            scrollTop: $el.offset().top - $('div.navbar.navbar-fixed-top').height(),
//            easing:'easeInQuad',
//            duration:1500
//        });
    },
    onError:function (model, errors, stuff) {
        console.log('error', arguments);
        var $error = $('.error-list', this.$el);
        if (errors) {
            var fields = this.form.fields;
            _.each(errors.error.errors, function (v, k) {
                var field = fields[v.path];
                if (field && field.$el)
                    field.$el.addClass('error');
                var $e = $('<li><span class="alert-heading pointer">"' + k + '" is in error: </span>' + v.message+'</li>').data('scroll-to', field.$el);
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
        _(save).each(function(v,k){

          if (k && k.indexOf('.') > -1){
              var split = k.split('.');
              var last = split.pop();
              var obj = save;
              _(split).each(function(kk,vv){
                 obj = (obj[kk] = {});
              });
              obj[last] =v;
              delete save[k];
          }
        })
        if (!errors) {
            this.form.model.save(save, {success:this.onSuccess, error:this.onError});
        } else {
            this.onError(this.form.model, errors);
        }

    },
    onSuccess:function (resp, obj) {
        if (obj.error) {
            this.onError(resp, obj);
        } else {
            $success =  $('.success-list', this.$el).empty();
            $success.append('<li class="alert alert-success"><a class="close" data-dismiss="alert">×</a><h4 class="alert-heading">Success!</h4>Successfully Saved ${_title()} ' + (obj.payload.id || obj.payload._id)  + '</li>')
            $success.show('slow');
        }
        console.log('${schema.modelName}/edit#onSuccess', arguments);
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
        window.location.hash = '#/${schema.modelName}/list';
    },
    render:function (opts) {
        var $el = this.$el.empty().append(this.template());
        var id = opts && (opts.id || opts._id);
        var model = new Model(opts);
        var title = id ? '<i class="icon-edit"></i> Edit ${_title()} [' + id + ']' : '<i class="icon-plus"></i>Create New ${_title()}';
        var form = this.form = new Form({
            model:model,
            fieldsets:[{legend:title, fields:fields}]
        });
        var $fm = $('.form-container', this.$el);
        if (id) {
            model.fetch({success:function () {
                var $fel = $(form.render().el)
                $fm.append($fel);

            }});
        } else {
            var $fel = $(form.render().el)
            $fm.append($fel);
        }
        $(this.options.container).empty().append($el);
        return this;
    }
});
return EditView;
});
