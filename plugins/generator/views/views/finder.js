// Filename: ${baseUrl}/js/views/list.js
define([
    'underscore',
    'libs/bobamo/list',
    'modelcollections/${model.modelName}',
    'text!templates/${model.modelName}/table.html',
    'text!templates/${model.modelName}/table-item.html'
], function (_,View, m, tableTemplate, tableItemTemplate) {
    "use strict";

    return View.extend({
        initialize:function(options, params){
          console.log('inititlize?', arguments);
            var FM =     m.Collection.extend({
                url:'${api}/${model.modelName}/finder/'+params.f
            });
            this.collection = new FM()
            View.prototype.initialize.apply(this, arguments);

        },
        template:_.template(tableTemplate),
 //       collection:collection,
        listItemTemplate:_.template(tableItemTemplate),
        config:{
            title:'${model.title}',
            modelName:'${model.modelName}',
            plural:'${model.plural}'
        }
    });
});
