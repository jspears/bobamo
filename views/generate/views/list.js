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
        tagName:'div',
        events:{
            'paginate-change .pager_table':'update',
            'sorter-change .sortable':'onSort'
        },
        initialize:function () {
            this.collection = collection;
            //  this.collection.bind("reset", this.renderList, this);
            this.collection.bind("add", this.renderItem, this);

        },
        renderItem:function (item) {

            if (this.$ul) {
                var lel = new ListItemView({model:item}).render().el;
                this.$ul.append(lel);
            }
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
            var $p = this.$paginate.paginate('wait');

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
                    self.renderList();
                    $p.paginate('update', resp);
                }});
            return this;
        },
        onSort:function (evt) {
            var obj = {field:evt.field, direction:evt.direction};
            this.sorts = $.filter(this.sorts, function (k, v) { return v.field === obj.field; })
            this.sorts.unshift(obj);
            this.update();
            return this;
        },
        render:function (obj) {
            this.$container = obj && obj.container ? $(obj.container) : $('#content');
            var $el = $(this.el);
            this.$container.children().detach();
            this.$container.append($el);
            if (this._rendered) {
                this.update();
                return this;
            }
            this._rendered = true;

            $el.append('<h3>{{html toTitle(schema) }}</h3>')

            this.$paginate = $('<div class="pager_table"></div>').paginate({
                limit:10,
                item:'${_schema(schema, true).modelName}',
                items:'${_schema(schema, true).display.plural}'
            });
            this.$table = $(tableTemplate);
            $('.sortable', this.$table).sorter();
            $el.append(this.$table);
            $el.append(this.$paginate);
            this.update();

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
            var json = this.model.toJSON();
            var tmpl = this.template(json);
            var $el = $(this.el);
            $el.html(tmpl);
            return this;
        }

    });
    return ListView;
});
