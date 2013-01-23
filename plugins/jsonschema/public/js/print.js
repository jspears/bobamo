// Filename: app.js
define([
    'jsonschema/view/doc',
    'jquery',
    'underscore',
    'Backbone',
    'text!jsonschema/tpl/swagger-print.html'

], function (DocView, $, _, Backbone, template) {

    var PrintDocView =  DocView.extend({
        template:_.template(template),
        initialize:function(){
            DocView.prototype.initialize.apply(this, _.toArray(arguments));
            this.on('doc-swagger-complete', function(){
                this.$el.find('.options').hide();
                this.$el.find('.sandbox_header').hide();
            }, this)
        }
    });
    var dv = new PrintDocView();
    dv.render({mode:'print'});

});
