// Filename: views/${schema.modelName}/list
define([
    'jquery',
    'underscore',
    'Backbone',
    'replacer',
    'libs/renderer/renderers',
    'libs/table/jquery.bobamo-paginate',
    'libs/table/jquery.sorter'

], function ($, _, Backbone, replacer, Renderer) {
    "use strict";
    function _null(v) {
        return v != null;
    };
    function _dir(v) {
        if (v.direction)
            return replacer('<span class="sortable elementActivate" data-field="{field}" data-label="{label}" data-direction="{direction}">{label}</span>',v);

        return null;
    };
    var ListItemView = Backbone.View.extend({
        tagName:"tr",
        initialize:function (options) {
            this.renderer = options && options.renderer || new Renderer();
            this.model.bind("change", this.render, this);
            this.model.bind("destroy", this.close, this);
            this.sort = [];
            return this;
        },
        format:function(field, idx, model, schema){
            return this.renderer.render(model.get(field),  field,  model, idx, schema && schema.renderer);
        },
        _fields:{},
        _format:function(field, idx){
            var schema = field in this._fields ? this._fields[field] : (this._fields[field] = this.schema(field, this.model));
            return this.format(field, idx, this.model, schema)
        },
        schema:function(field, model){
            if (!(model || field))
                return null;
            var fields = field.split('.');

            var schema = model.schema;
            if (!schema) return null;
            var val = schema[fields.shift()];
            while(fields.length){
                var key = fields.shift();
                if (val && val.subSchema)
                    val = val.subSchema[key];
                else{
                    console.log('no schema for ', fields, field, key);
                    return null;
                }
            }
            return val;
        },
        render:function (eventName) {
            var tmpl = (this.template || this.options.template)({item:this.model, format:_.bind(this._format, this)});
            var $el = $(this.el);
            $el.html(tmpl);
            return this;
        }

    });
    var ListView = Backbone.View.extend({
        tagName:'div',
        classNames:['span7'],
        events:{
            'paginate-change .pager_table':'doPage',
            'sorter-change .sortable':'onSort'
        },
        renderer:new Renderer({}),
        initialize:function (options) {
            if (!this.template) {
                throw new Error('template must be defined');
            }
            if (!this.collection){
                throw new Error('collection must be defined');
            }
            this.collection.on('reset', this.renderList, this);
            this.collection.on('fetch', function(){
                console.log('fetch', arguments)
                this.renderList.apply(this, _.toArray(arguments)) }, this);

            return this;
        },
        itemView:ListItemView,
        renderItem:function (item) {
            var template = this.listItemTemplate;
            if (this.$ul) {
                var lel = new ListItemView({model:item, renderer:this.renderer, template:template}).render().el;
                this.$ul.append(lel);
            }
            return this;
        },
        renderList:function () {
            console.log('renderList',arguments)
            this.$ul = this.$el.find('tbody');
            this.$ul.children().remove();
            _.each(this.collection.models, this.renderItem, this);
            this.$paginate.paginate('update', {sort:this.sort_str ? ' sorting by: ' + this.sort_str : '', total:this.collection.total});
            $('.sortable', this.$table).sorter();
            this.trigger('fetched', arguments);
            return this;
        },

        doPage:function (evt) {
            this.update('Loading page <b>' + evt.page + '</b> of {items}');
            return this;
        },
        update:function (message, opt) {
            var $p = this.$paginate.paginate('wait', message);

            var self = this;
            var params = this.collection.params;
            var data = _.extend({
                limit:parseInt($p.attr('data-limit')),
                skip:Math.max(0, parseInt($p.attr('data-skip')))
            },opt);
            var sort = [];
            _.each(this.sorts, function (v, k) {
                if (!v.direction) return;
                sort.push([v.field, v.direction].join(':'));
            });
            var populate = [];
            _.each(this.renderer.config, function(v){
                console.log('renderer',v);
                if (v.property && ~v.property.indexOf('.')){
                    //TODO - Mongoose throws an exception if you populate a non IdRef  fix mers so that it doesn't
                    // send it.
                    var mangle = v.property.split('.');
                    mangle.pop();
                    populate.push(mangle.join('.'))
                }
            });
            if (populate.length)
                data.populate = populate.join(',');

            this.collection.params = data;
            data.sort = sort.join(',');
            this.collection.fetch({data:data, success:_.bind(this._fetch, this)});
            return this;
        },
        _fetch:function(){
          this.collection.trigger('list-data', arguments);
        },
        onSort:function (evt) {
            var obj = {field:evt.field, direction:evt.direction, label:evt.label};
            this.sorts = _.filter(this.sorts, function (v, k) {
                return v.field != obj.field;
            })
            this.sorts.unshift(obj);
            var str = _(this.sorts).map(_dir).filter(_null).join(', ')
            this.sort_str = str;
            this.update('Sorting {items} ' + ( str ? 'by ' + str : 'naturally' )+'.');

            return this;
        },
        render:function (obj) {
            this.$container = obj && obj.container ? $(obj.container) : $('#content');
            this.$table = $(this.template());
            this.$paginate = $('.pager_table', this.$table).paginate();
            this.$el.append(this.$table);
            this.update('Loading {items}');
            this.$container.html(this.$el);
            return this;
        }
    });

    return ListView;
});
