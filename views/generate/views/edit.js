require(['Backbone.Form', 'jquery', 'modelcollections/${schema.modelName}'], function (Backbone, $, model) {

    var formView = Backbone.View.extend({
        el:'#content',
        render:function (opts) {
            var $el =$(this.el);
            var id = opts && (opts.id || opts._id);
            var form = this.form = new Backbone.Form({
                model:id ? model.collection.get(id) : new model.model(opts),
                fields:{{html createFields(schema)}}
            }).render();

            $el.empty();
            $el.append('<h3>'+{{toTitle(schema)}}+'</h3>')
            $el.append(form.el);

            return this;
        }
    });
    return formView;
});