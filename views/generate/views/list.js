// Filename: views/${schema.modelName}/list
define([
    'jQuery',
    'Underscore',
    'Backbone',
    'collections/${schema.modelName}',
    'text!templates/${schema.modelName}/list.html'
], function ($, _, Backbone, collection, ${schema.modelName}ListTemplate) {
    var ${schema.modelName}ListView = Backbone.View.extend({
        el:"#page",
        initialize:function () {
            _.bind(this.render, this);
            this.collection = collection;
            this.collection.fetch({success:this.render})
        },
        render:function () {
            var data = {
                items:this.collection.models,
                _:_
            };
            var compiledTemplate = _.template(${schema.modelName}ListTemplate, data);
            $(this.el).html(compiledTemplate);
        }
    });
    return new ${schema.modelName}ListView;
});
