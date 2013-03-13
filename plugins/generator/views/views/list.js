// Filename: ${baseUrl}/js/views/list.js
define([
    'underscore',
    'libs/bobamo/list',
    'collections/${model.modelName}',
    'libs/renderer/renderers',
    'libs/renderer/Text',
    'text!templates/${model.modelName}/table.html',
    'text!templates/${model.modelName}/table-item.html'
], function (_,View, collection, Renderer, Text, tableTemplate, tableItemTemplate) {
    "use strict";
    var renderer = new Renderer();
    {{each(i,l) model.list_fields}}
    renderer.add({{json model.renderer(i)}});
    {{/each}}

    return View.extend({
        template:_.template(tableTemplate),
        collection:collection,
        listItemTemplate:_.template(tableItemTemplate),
        renderer:renderer,
        config:{
            title:'${model.title}',
            modelName:'${model.modelName}',
            plural:'${model.plural}'
        }
    });
});
