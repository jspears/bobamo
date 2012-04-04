define(['libs/bobamo/delete'], function (DeleteView) {
    "use strict";

    return DeleteView.extend({
        config:{
            modelName:'${model.modelName}',
            title:'${model.title}',
            redirect:'#/${model.modelName}/list?refresh=true'
        }
    });

})