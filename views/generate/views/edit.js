define([
    'jQuery',
    'underscore',
    'Backbone',
    'Backbone.Form',

    'collections/${schema.modelName}',
    'models/${schema.modelName}',
    'text!templates/${schema.modelName}/list.html',
    'libs/backbone-forms/src/templates/bootstrap',
    'jquery-ui'
].concat({{html createEditors(schema) }}),
function ($, _, Backbone, Form, collection, Model, template) {
    var fields = {{html createFields(schema)}};
var EditView = Backbone.View.extend({
    el:'#content',
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
        if (errors) {
            var fields = this.form.fields;
            _.each(errors.error.errors, function (v, k) {
                var field = fields[v.path];
                if (field && field.$el)
                    field.$el.addClass('error');
                var $e = $('<li><span class="alert-heading pointer">"' + k + '" is in error: </span>' + v.message+'</li>').data('scroll-to', field.$el);
                this.$error.prepend($e);
            }, this);
            this.$error.show('slow');
        }
    },

    onSave:function () {

        this.form.validate();
        var errors = this.form.commit();

        var save = this.form.getValue();
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
            this.$el.append('<div style="clear:right" class="alert alert-success"><a class="close" data-dismiss="alert">×</a><h4 class="alert-heading">Success!</h4>Successfully Saved ${schema.modelName} ' + (obj.payload.id || obj.payload._id) + '</div>')
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
        var $el = $(this.el);
        var id = opts && (opts.id || opts._id);
        var model = new Model(opts);
        model.bind('change', function(){
           console.log('change');
        });
        var title = id ? '<i class="icon-edit"></i> Edit ${toTitle(schema)} [' + id + ']' : '<i class="icon-plus"></i>Create New ${toTitle(schema)}';
        var form = this.form = new Form({
            model:model,
            fieldsets:[{legend:title, fields:fields}]
        });

 //        form.classNames = 'form-horizontal';
        $el.empty();
//        $el.append('<h3>' + title + '</h3>')
        this.$error = $('<ul style="display:none" class="alert alert-error unstyled error-list"></ul>');
        $el.append(this.$error);
        var $fm = $('<div class="row"></div >')
        $el.append($fm);
        if (id) {
            model.fetch({success:function () {
                var $fel = $(form.render().el)
                $fm.append($fel);

            }});
        } else {
            var $fel = $(form.render().el)
            $fm.append($fel);
        }

        var $div = $('<div class="form-actions ">');
        this.$save = $('<button class="btn cancel">Cancel</button>');
        this.$cancel = $('<button type="submit" class="btn pull-right btn-primary save">Save</button>');
        $div.append(this.$save, this.$cancel);
        $el.append($div);
        return this;
    }
});
return EditView;
});