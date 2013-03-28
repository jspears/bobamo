define(['underscore','Backbone', 'Backbone.Form'], function(_, B, Form){

    var editors = Form.editors;
    var DynaNestedModel = editors['DynaNestedModel' ] = editors.NestedModel.extend({
        initialize: function(options) {
            editors.Base.prototype.initialize.call(this, options);

            if (!options.schema.model)
                throw 'Missing required "schema.model" option for NestedModel editor';
        }

    });
    return DynaNestedModel

});