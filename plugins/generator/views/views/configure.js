define(['Backbone', 'libs/bobamo/edit',
    'views/configure-model/${plugin.name}',
    'text!templates/${plugin.name}/configure.html',
    'Backbone.Form/form-model'], function(B, Edit, Model, template){
    var model = Model.prototype;
    return Edit.extend({
        model:Model,
        template:_.template(template),
        fieldsets:model.fieldsets,
        config:{
            title:model.title,
            plural:model.plural,
            modelName:model.modelName
        }
    })

});