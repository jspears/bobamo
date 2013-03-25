define(['modeleditor/views/admin/schema-collection',
    'underscore', 'Backbone', 'libs/bobamo/list',  'text!modeleditor/views/templates/admin/table.html',
    'text!modeleditor/views/templates/admin/table-item.html'], function (collection, _, Backbone, ListView, tableTemplate, listItemTemplate) {


    return ListView.extend({
        template:_.template(tableTemplate),
        listItemTemplate:_.template(listItemTemplate),
        collection:collection,
        model:collection.model,
        config:{
            title:'Model',
            modelName:'model',
            plural:'Models'
        }

    })
})
;