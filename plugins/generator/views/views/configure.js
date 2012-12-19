define(['Backbone', 'libs/bobamo/edit', 'text!tpl/edit.html', 'libs/editors/multi-editor'], function(B, Edit, template){
    var model = {{html JSON.stringify(plugin.admin())}};

    return Edit.extend({
        model:B.Model.extend(model),
        template:_.template(template),
        fieldsets:model.fieldsets,
        config:{
            title:model.title,
            plural:model.plural,
            modelName:model.modelName
        }
    })

});