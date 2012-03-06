define([
    'jQuery',
    'underscore',
    'Backbone',
    'Backbone.Form',
    'collections/${schema.modelName}',
    'models/${schema.modelName}',
    'text!templates/${schema.modelName}/list.html',
    'jquery-ui'
].concat({{html createEditors(schema)}}),  function ( $, _, Backbone, Form, collection, Model, template) {
    var fields = {{html createFields(schema)}};
    var EditView = Backbone.View.extend({
        el:'#content',
        events:{
          'click button.save':'onSave',
          'click button.cancel':'onCancel'
        },
        initialize:function(){
          _.bindAll(this);
        },
        onError:function(model, errors, stuff){
            console.log('error',arguments);
             if (errors){
                    var fields = this.form.fields;
                    _.each(errors.error.errors, function(v,k){
                        var field = fields[v.path];
                        if (field && field.editor){
                            field.editor.$el.addClass('bbf-error');
//                            field.$el.addClass('fs-error');
                        }
                        this.$error.append('<span class="alert-heading">"'+k+'" is in error: </span>'+v.message);
                    }, this);
             this.$error.show('slow');
             }
        },

        onSave:function(){

            this.form.validate();
            var errors = this.form.commit();

            var save = this.form.getValue();
            if(!errors){
                this.form.model.save(save, {success:this.onSuccess, error:this.onError});
            }else{
                this.onError(this.form.model, errors);
            }

        },
        onSuccess:function(resp, obj){
            if (obj.error){
                this.onError(resp, obj);
            }else{
                this.$el.append('<div style="clear:right" class="alert alert-success"><a class="close" data-dismiss="alert">×</a><h4 class="alert-heading">Success!</h4>Successfully Saved ${schema.modelName} '+(obj.payload.id || obj.payload._id)+'</div>')
            }
            console.log('${schema.modelName}/edit#onSuccess',arguments);
        },
        onCancel:function(){
            window.location.hash = '#/${schema.modelName}/list';
        },
        render:function (opts) {
            var $el =$(this.el);
            var id = opts && (opts.id || opts._id);
            var model = new Model(opts);
            var form = this.form = new Form({
                model:model,
                fields:fields
            });


            $el.empty();
            var title = id ? 'Edit ${toTitle(schema)} ['+id+']' : 'Create New ${toTitle(schema)}';
            $el.append('<h3>'+title+'</h3>')
            this.$error = $('<div style="display:none" class="alert alert-error"></div>');
            $el.append(this.$error);
            var $fm = $('<div></div >')
            $el.append($fm);
            if (id){
                model.fetch({success:function(){
                    $fm.append(form.render().el);
                }});
            }else{
                $fm.append(form.render().el);
            }

            var $div = $('<div class="btn-group pull-right">');
            this.$save = $('<button class="btn cancel">Cancel</button>');
            this.$cancel = $('<button class="btn primary save">Save</button>');
            $div.append(this.$save, this.$cancel);
            $el.append($div);
            return this;
        }
    });
    return EditView;
});