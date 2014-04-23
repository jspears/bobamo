define(['Backbone.Form','underscore','libs/jquery/jquery.iframe-post-form'], function(Form, _){
    "use strict";


    var FileEditor = Form.editors.File = Form.editors.Text.extend({

        initialize:function(options){

            options.schema.dataType = 'file';
            Form.editors.Text.prototype.initialize.call(this, options);
        }
    });

    return FileEditor;

});