// Filename: views/${schema.modelName}/list
define([
    'jquery',
    'underscore',
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
        if (v.direction)
          return '<span class="sortable elementActivate" data-field="'+v.field+'" data-label="'+v.label+'" data-direction="'+v.direction+'">'+v.label+'</span>';

        return null;
//        return v.direction ? v.label + " " + (v.direction > 0 ? " ascending" : "descending") : null;
    };
    var ListView = Backbone.View.extend({
        tagName:'div',
        classNames:['span7'],
        events:{
            'paginate-change .pager_table':'doPage',
            'sorter-change .sortable':'onSort'
        },
        template:_.template(tableTemplate),
        initialize:function () {
            this.collection = collection;
            return this;
        },
        renderItem:function (item) {

            if (this.$ul) {
                var lel = new ListItemView({model:item}).render().el;
                this.$ul.append(lel);
            }
            return this;
        },
        renderList:function () {
            this.$ul = this.$el.find('tbody').empty();
            _.each(this.collection.models, this.renderItem, this);
            return this;
        },
        sorts:[],
        doPage:function(evt){
            this.update('Loading page <b>'+evt.page+'</b> of {items}');
            return this;
        },
        update:function (message) {
            var $p = this.$paginate.paginate('wait', message);

            var self = this;
            var data = {
                limit:10,
                skip:Math.max(0, parseInt($p.attr('data-skip')) -1) //TODO fix the paginator
            };
            var sort = [];
            _.each(this.sorts, function (v, k) {
                if (!v.direction) return;
                sort.push([v.field, v.direction].join(':'));
            });

            data.sort = sort.join(',');
            this.collection.fetch({
                data:data,
                success:function (arg, resp) {
                    self.renderList();
                    setTimeout(function () {
                        resp.sort = self.sort_str ? ' sorting by: '+self.sort_str : '';
                        $p.paginate('update', resp).find('.sortable').sorter();
                    }, 800);
                }});
            return this;
        },
        onSort:function (evt) {
            var obj = {field:evt.field, direction:evt.direction, label:evt.label};
            this.sorts = _.filter(this.sorts, function (v, k) {
                return v.field != obj.field;
            })
            this.sorts.unshift(obj);
            var str = _(this.sorts).map(_dir).filter(_null).join(', ')
            this.sort_str = str;
            this.update('Sorting {items} ' + ( str ? 'by ' + str : 'naturally' ));

            return this;
        },
        render:function (obj) {
            this.$container = obj && obj.container ? $(obj.container) : $('#content');
            this.$table = $(this.template());
            this.$paginate = $('.pager_table', this.$table).paginate();
            $('.sortable', this.$table).sorter();
            this.$el.append(this.$table);
            this.update();
            this.$container.empty().append(this.$el);
            return this;
        }
    });
    var ListItemView = Backbone.View.extend({
        tagName:"tr",
        template:_.template(tableItemTemplate),
        initialize:function () {
            this.model.bind("change", this.render, this);
            this.model.bind("destroy", this.close, this);
            return this;
        },

        render:function (eventName) {
            var tmpl = this.template({item:this.model});
            var $el = $(this.el);
            $el.html(tmpl);
            return this;
        }

    });
    return ListView;
});
