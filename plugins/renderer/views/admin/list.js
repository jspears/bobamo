define(['underscore', 'Backbone', 'libs/bobamo/list', 'renderer/js/collection', 'text!${pluginUrl}/templates/table.html',
    'text!${pluginUrl}/templates/table-item.html'], function (_, Backbone, ListView,collection, tableTemplate, listItemTemplate) {


    return ListView.extend({
        template:_.template(tableTemplate),
        listItemTemplate:_.template(listItemTemplate),
        collection:collection,
        model:collection.model,
        config:{
            title:'Renderer',
            modelName:'renderer',
            plural:'Renderers'
        }

    })
})
;