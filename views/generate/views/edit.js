define([
    'jQuery',
    'Underscore',
    'Backbone',
    'Backbone.Form',
    'collections/${schema.modelName}',
    'models/${schema.modelName}',
    'text!templates/${schema.modelName}/list.html',
    'jquery-editors','jquery-ui'
],  function ( $, _, Backbone, Form, collection, Model, template) {
    var fields = {{html createFields(schema)}};
    var EditView = Backbone.View.extend({
        el:'#content',
        renderForm:function(){

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
            var title = id ? 'Edit ${toTitle(schema)} ['+id+']' : 'Create New';
            $el.append('<h3>'+title+'</h3>')

            var $fm = $('<div></div>')
            $el.append($fm);
            if (id){
                model.fetch({success:function(){
                    $fm.append(form.render().el);
                }});
            }else{
                $fm.append(form.render().el);
            }

            var $div = $('<div class="btn-group pull-right">');

            $div.append('<button class="btn">Cancel</button>');
            $div.append('<button class="btn">Submit</button>');
            $el.append($div);
            return this;
        }
    });
    return EditView;
});