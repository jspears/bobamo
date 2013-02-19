define(['underscore', 'Backbone', 'libs/bobamo/edit',   'renderer/js/collection', 'text!renderer/templates/edit.html'], function(_, B, EditView, collection, template){
    var RendererEdit = EditView.extend({
        collection:collection,
        model:collection.model,
        template:_.template(template)
    });

    return RendererEdit;


})