// Filename: views/${schema.modelName}/list
define([
    'underscore',
    'libs/bobamo/list',
    'collections/${schema.modelName}',
    'text!templates/${schema.modelName}/table.html',
    'text!templates/${schema.modelName}/table-item.html'
], function (_,View, collection, tableTemplate, tableItemTemplate) {
    "use strict";

    return View.extend({
        template:_.template(tableTemplate),
        collection:collection,
        listItemTemplate:_.template(tableItemTemplate),
        config:{
            title:'${schema.title}',
            modelName:'${schema.modelName}',
            plural:'${schema.plural}'
        }
    });
});
