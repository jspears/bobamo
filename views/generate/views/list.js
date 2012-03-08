// Filename: views/${schema.modelName}/list
define([
    'jQuery',
    'Underscore',
    'Backbone',
    'collections/${schema.modelName}',
    'text!templates/${schema.modelName}/table.html',
    'text!templates/${schema.modelName}/table-item.html'
], function ($, _, Backbone, collection, tableTemplate, tableItemTemplate) {
    "use strict";

    var ListView = Backbone.View.extend({
        el:'#content',
        initialize:function () {
            var self = this;
            this.collection = collection;
         //  this.collection.bind("reset", this.renderList, this);
            this.collection.bind("add", this.renderItem, this);

        },
        renderItem:function (item) {
            console.log('renderItem', item);
            if (this.$ul)
                this.$ul.append(new ListItemView({model:item}).render().el);
            else
                console.log('trying to add item but not rendered yet',item);
        },
        renderList:function () {
            console.log('renderList');
            var $ul = this.$ul;
            if (!$ul) {
                this.$el.append(tableTemplate);
                $ul = this.$ul = this.$el.find('tbody');
            } else {
                $ul.empty();
            }
            return this;
        },
        render:function (obj) {
           // this.$el = obj && obj.container ? $(obj.container) : $('#content');
            var $el = $(this.el);
            $el.empty();
            $el.append('<h3>{{html toTitle(schema) }}</h3>')
            this.renderList();
            var self = this;
            this.collection.fetch({success:function(){
                console.log('fetch')
                self.collection.models.forEach(self.renderItem,self);
            }});
//            this.collection.fetch({success:function(){
//                console.log('fetch->success', arguments)
//            }});
            return this;
        }
    });
    var ListItemView = Backbone.View.extend({

        tagName:"tr",
        template:_.template(tableItemTemplate),
        initialize:function () {
            this.model.bind("change", this.render, this);
            this.model.bind("destroy", this.close, this);
        },

        render:function (eventName) {
            console.log('renderItem')
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }

    });
    return ListView;
});
