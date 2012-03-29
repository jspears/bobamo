define(['libs/bobamo/delete'], function (DeleteView) {
    "use strict";

    return DeleteView.extend({
        config:{
            modelName:'${schema.modelName}',
            title:'${schema.title}',
            redirect:'#/${schema.modelName}/list?refresh=true'
        }
    });

})