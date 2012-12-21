define(['Backbone', 'libs/bobamo/edit', 'text!tpl/edit.html', 'libs/editors/multi-editor'], function(B, Edit, template){
    var model = {{html JSON.stringify(plugin.admin())}};
    console.log('configure', model);
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