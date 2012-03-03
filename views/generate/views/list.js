// Filename: views/${schema.modelName}/list
define([
    'jQuery',
    'Underscore',
    'Backbone',
    'collections/${schema.modelName}',
    'text!templates/${schema.modelName}/list.html'
], function ($, _, Backbone, collection, listTemplate) {
    "use strict";
    var ListView = Backbone.View.extend({
        el:'#content',
//        tagName:'ul',

        className:'nav nav-list',

        initialize:function () {
            var self = this;
            this.collection = collection;
            this.collection.bind("reset", this.renderList, this);
            this.collection.bind("add", this.renderItem, this);

        },
        renderItem:function (item) {
            console.log('add', item);
            if (this.$ul)
                this.$ul.append(new ListItemView({model:item}).render().el);
            else
                console.log('trying to add item but not rendered yet',item);
        },
        renderList:function () {
            console.log('renderList');
            var $ul = this.$ul;
            if (!$ul) {
                $(this.el).append(($ul = this.$ul = $("<ul nav nav-list></ul>")));
            } else {
                $ul.empty();
            }
            return this;
        },
        render:function (eventName) {
            var $el = $(this.el);
            $el.empty();
            $el.append('<h3>{{html toTitle(schema) }}</h3>')
            this.renderList();
            this.collection.each(this.renderItem, this);
            this.collection.fetch();
//            this.collection.fetch({success:function(){
//                console.log('fetch->success', arguments)
//            }});
            return this;
        }
    });
    var ListItemView = Backbone.View.extend({

        tagName:"li",

        initialize:function () {
            this.template = _.template(listTemplate);
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
