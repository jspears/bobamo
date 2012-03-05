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
        render:function (opts) {
            var $el =$(this.el);
            var id = opts && (opts.id || opts._id);
            var model = new Model(opts);
            if (id){
                model.fetch();
            }
            var form = this.form = new Form({
                model:model,
                fields:fields
            }).render();

            $el.empty();
            var title = id ? 'Edit ${toTitle(schema)} ['+id+']' : 'Create New';
            $el.append('<h3>'+title+'</h3>')
            $el.append(form.el);

            return this;
        }
    });
    return EditView;
});