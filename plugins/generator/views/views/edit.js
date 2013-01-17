
define({{html includes(
    ['underscore',
    'libs/bobamo/edit',
    'collections/<%=collection%>',
    'models/<%=collection%>',
    'text!templates/<%=collection%>/edit.html',
    'libs/backbone-forms/templates/bootstrap',
    'jquery-ui',
    'libs/backbone-forms/editors/list'])}}
    , function (_,EditView, collection, Model, template) {
    "use strict";

    var fieldsets = {{json model.fieldsets }};
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
