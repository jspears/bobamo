define([
    'underscore',
    'Backbone'
], function(_, Backbone) {
    "use strict";

    //we define these together because they often link together and if they are in seperate callbacks bad things happen.

    var schema = {{html JSON.stringify(model.schemaFor(model.fieldsets || model.edit_fields))}};
    var defaults = {{html JSON.stringify(model.defaults || {})}};

    var Model = Backbone.Model.extend({
        urlRoot:'${api}/${urlRoot}',
        schema:schema,
        defaults:defaults,
        initialize: function() {},
        parse:function(resp) {

            console.log('/${api}/${model.modelName}model#parse', resp);
            var fix  = resp.payload ? resp.payload : resp
            return _.isArray(fix) ? fix[0] : fix;
        },
        get:function(key){
            if (key && key.indexOf('.') > -1){
                var split = key.split('.');
                var val = this.attributes;
                while (split.length && val)
                    val = val[split.shift()];

                return val;
            }
            return Backbone.Model.prototype.get.call(this, key);
        },
        labelAttr:"${model.labelAttr}",
        toString:function(){
            if (this.labelAttr)
                return this.get(this.labelAttr);

            return Backbone.Model.prototype.toString.call(this);
        }

    });
    var Collection = Backbone.Collection.extend({
        model: Model,
        url:'${api}/${urlRoot}',
        initialize: function() {
             this.total = 0;
        },
        parse:function(resp) {
            console.log('Collection#parse ${model.modelName}', resp.payload);
            this.total = resp.total;
            return resp.payload ? resp.payload : resp;
        }
    });


    return {
        Model:Model,
        Collection:Collection
    };

});
