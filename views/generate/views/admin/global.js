define([
    'underscore',
    'Backbone',
    'libs/bobamo/edit',
    'text!templates/admin/global.html',
    'jquery-ui',
    'libs/backbone-forms/src/jquery-ui-editors',
    'libs/editors/multi-editor'
], function (_,Backbone, EditView, template) {
    "use strict";

var schema = {
    title:{help:'Application Title'},
    version:{help:'Version of application'},
    models:{
        type:'MultiEditor',
        help:'Which Models to allow users to view',
        options:{{html JSON.stringify(Object.keys(factory.modelPaths))}}
    }
}
var Model = Backbone.Model.extend({
    schema:schema,
    url:'admin/app',
    parse:function(resp){
        console.log('response',resp);
        return resp.payload;
    },
    idAttribute:'app',
    get:function(key){
        if (key && key.indexOf('.') > -1){
            var split = key.split('.');
            var val = this.attributes;
            while (split.length && val)
                val = val[split.shift()];

            return val;
        }
        return Backbone.Model.prototype.get.call(this, key);
    }

});
return EditView.extend({
    fieldsets:[{legend:'Application', fields:['title','version']}, {'legend':'Models', fields:['models']}],
    template:_.template(template),
    model:Model,
    isWizard:true,
    config:{
        title:'App',
        plural:'App',
        modelName:'app'
    }
});
});
