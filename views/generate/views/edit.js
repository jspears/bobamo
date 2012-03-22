define([
    'underscore',
    'libs/mojaba/edit',
    'collections/${schema.modelName}',
    'models/${schema.modelName}',
    'text!templates/${schema.modelName}/edit.html',
    'libs/backbone-forms/src/templates/bootstrap',
    'jquery-ui'
].concat({{html _editors(false)}}), function (_,EditView, collection, Model, template) {
    "use strict";

    var fields = {{html JSON.stringify(schema.edit_fields) }};
    return EditView.extend({
        fields:fields,
        template:_.template(template),
        collection:collection,
        model:Model,
        config:{
            title:'${schema.title}',
            plural:'${schema.plural}',
            modelName:'${schema.modelName}'
        }
    });
});
