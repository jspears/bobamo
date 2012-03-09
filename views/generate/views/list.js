// Filename: views/${schema.modelName}/list
define([
    'jquery',
    'Underscore',
    'Backbone',
    'collections/${schema.modelName}',
    'text!templates/${schema.modelName}/table.html',
    'text!templates/${schema.modelName}/table-item.html',
    'libs/table/jquery.mojaba-paginate',
    'libs/table/jquery.sorter'

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
            if (this.$ul)
                this.$ul.append(new ListItemView({model:item}).render().el);
            else
                console.log('trying to add item but not rendered yet', item);
        },
        renderList:function () {
            var $ul = this.$ul;
            if (!$ul) {

                $ul = this.$ul = this.$el.find('tbody');
            } else {
                $ul.empty();
            }
            this.collection.models.forEach(this.renderItem, this);
            return this;
        },
        sorts:[],

        update:function () {
            var $p = this.$paginate;
            var self = this;
            var data = {
                limit:10,
                skip:$p.attr('data-skip')
            };
            var sort = [];
            _.each(this.sorts, function (v, k) {
                if (!v.direction) return;
                sort.push([v.field, v.direction].join(':'));
            });

            data.sort = sort.join(',');
            console.log('sort', data.sort);
            this.collection.fetch({
                data:data,
                success:function (arg, resp) {
                    console.log('fetch', arguments)
                    self.renderList();
                    $p.paginate('update', resp);
                }});

        },
        render:function (obj) {
            // this.$el = obj && obj.container ? $(obj.container) : $('#content');
            var $el = $(this.el);
            $el.empty();
            $el.append('<h3>{{html toTitle(schema) }}</h3>')
            var self = this;
            var p = this.$paginate = $('<div></div>').paginate({
                limit:10,
                item:'${_schema(schema, true).modelName}',
                items:'${_schema(schema, true).display.plural}'
            });
            p.on('paginate-change', function (event) {
                var $this = $(this);
                $this.paginate('wait');
                self.update();
            });
            this.$table = $(tableTemplate);
            $('.sortable', this.$table).sorter().on('sorter-change', function (evt) {
                self.sorts.push({field:evt.field, direction:evt.direction});
                self.update();
            });
            $el.append(this.$table);
            $el.append(p);
            this.update();
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
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }

    });
    return ListView;
});
