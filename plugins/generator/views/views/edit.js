
define([
    'underscore',
    'libs/bobamo/edit',
    'collections/${collection}',
    'models/${collection}',
    'text!templates/${collection}/edit.html',
    'libs/backbone-forms/templates/bootstrap',
    'jquery-ui',
    'libs/backbone-forms/editors/list'
]
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
        },
        render:function(opts){
            this.collection.currentId = opts && ( opts.id || opts._id);
            return EditView.prototype.render.apply(this, _.toArray(arguments));
        },
        onNext:function(){
            console.log('next',collection)
            collection.nextId(function(id){
                console.log('nextId', id);
                if (id){
                    collection.currentId = id;
                    window.location.hash = '#/views/${model.modelName}/edit?id='+id;
                }else{
                    alert('alread at the end');

                }
            });
        },
        onPrevious:function(){
            console.log('previous',collection)
            collection.previousId(function(id){
                console.log('previousId', id);
                if (id){
                    collection.currentId = id;
                    window.location.hash = '#/views/${model.modelName}/edit?id='+id;
                }else{
                    alert('already at the beginning');
                }
            });
        }
    });
});
