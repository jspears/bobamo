define([
    'underscore',
    'libs/bobamo/edit',
    'collections/${model.modelName}',
    'models/${model.modelName}',
    'text!templates/${model.modelName}/edit.html',
    'libs/backbone-forms/src/templates/bootstrap',
    'jquery-ui',
    'libs/backbone-forms/src/jquery-ui-editors'
].concat({{html JSON.stringify(model.editorsFor())}}), function (_,EditView, collection, Model, template) {
    "use strict";

    var fieldsets = eval('({{html JSON.stringify(model.fieldsets) }})');
    return EditView.extend({
        fieldsets:fieldsets,
        template:_.template(template),
        collection:collection,
        model:Model,
        config:{
            title:'${model.title}',
            plural:'${model.plural}',
            modelName:'${model.modelName}'
        }
    });
});
