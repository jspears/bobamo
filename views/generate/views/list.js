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
    function _null(v) {
        return v != null;
    };
    function _dir(v){
        return v.direction ? v.label + " " + (v.direction > 0 ? " ascending" : "descending") : null;
    };
    var ListView = Backbone.View.extend({
        tagName:'div',
        events:{
            'paginate-change .pager_table':'update',
            'sorter-change .sortable':'onSort'
        },
        initialize:function () {
            this.collection = collection;
            //  this.collection.bind("reset", this.renderList, this);
//            this.collection.bind("add", this.renderItem, this);

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
            this.$ul = this.$el.find('tbody').empty();
            this.collection.models.forEach(this.renderItem, this);
            return this;
        },
        sorts:[],

        update:function (message) {
            var $p = this.$paginate.paginate('wait', message);

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
                    setTimeout(function () {
                        $p.paginate('update', resp);
                    }, 800);
                }});
            return this;
        },
        onSort:function (evt) {
            console.log('onSort', evt);
            var obj = {field:evt.field, direction:evt.direction, label:evt.label};
            this.sorts = _.filter(this.sorts, function (v, k) {
                return v.field != obj.field;
            })
            this.sorts.unshift(obj);
            var str = _(this.sorts).map(_dir).filter(_null).join(', ')
            this.update('Sorting {items} ' + ( str ? 'by ' + str : 'naturally' ));
            return this;
        },
        render:function (obj) {
            this.$container = obj && obj.container ? $(obj.container) : $('#content');
            var $el = this.$el;
            this.collection.reset();
            $el.empty();
            if (this.$paginate)
                this.$paginate.remove();
            if (this.$table)
                this.$table.remove();

            this.$paginate = $('<div class="pager_table"></div>').paginate({
                limit:10,
                item:'${_schema(true).modelName}',
                items:'${_schema(true).display.plural}'
            });
            this.$table = $(tableTemplate);
            $('.sortable', this.$table).sorter();

            $el.append('<h3>{{html toTitle(schema) }}</h3>')
            $el.append(this.$table);
            $el.append(this.$paginate);
            this.update();
            this.$container.empty().append($el);
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
