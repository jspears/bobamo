// Filename: ${baseUrl}/js/views/list.js
define([
    'underscore',
    'libs/bobamo/list',
    'collections/${model.modelName}',
    'text!templates/${model.modelName}/table.html',
    'text!templates/${model.modelName}/table-item.html'
], function (_,View, collection, tableTemplate, tableItemTemplate) {
    "use strict";

    return View.extend({
        template:_.template(tableTemplate),
        collection:collection,
        listItemTemplate:_.template(tableItemTemplate),
        config:{
            title:'${model.title}',
            modelName:'${model.modelName}',
            plural:'${model.plural}'
        }
    });
});
