// Filename: ${baseUrl}/js/views/finder.js

define(
    [   'underscore',
        'Backbone',
        'Backbone.Form',
        'backbone-modal',
        'libs/bobamo/list',

        'collections/${collection}',
        'text!templates/${collection}/table.html',
        'text!templates/${collection}/table-item.html'

    ]
    , function (_, B, Form, Modal, View, collection, tableTemplate, tableItemTemplate) {
        "use strict";
        var finder = {{json finder }}
var qform = {{json model}};
//    var qform = _.extend({schema:_qform.paths}, _.omit(_qform, 'paths'));
var Model = B.Model.extend(qform);
var FinderModel = new Model;
define('findermodel/${model.modelName}/${view}', function () {
    return FinderModel;
})
return View.extend({
    collection:collection,
    events:_.extend({}, View.prototype.events, {
        submit:'onFormSubmit',
        'click .open-modal':'onOpenModalClick'
    }),
    initialize:function () {
        View.prototype.initialize.apply(this, _.toArray(arguments));
        if (qform.schema) {
            this.model = FinderModel;
            this.form = new Form({model:this.model});
            _.each(this.model.events, function (k, v) {
                this.form.on(v, _.bind(this[k], this));
            }, this)
        }

    },
    onFormSubmit:function (e) {
        if (e && e.preventDefault)
            e.preventDefault();
        console.log('onFormSubmit', this.form.getValue());
        if (finder.display.method !== 'GET') {
            console.log('method is ', finder.display.method, 'Not implemented');
        }
        this.$paginate.paginate('update', {skip:0}); //reset the skip.
        this.update(null, {skip:0});
    },
    onOpenModalClick:function (e) {
        var data = $(e.currentTarget).data('data') || e;
        if (!data) {
            console.log('no data from target');
            return;

        }
        var view = data.href;
        var idx = view.indexOf('#');
        if (~idx) {
            view = view.substring(idx + 1);
        }
        var viewArr = _.isArray(view) ? view : [view];

        var self = this;
        require(viewArr, function (V) {

            var m = new Modal({
                content:new V
            }).open()

        });

        return false;
    },
    update:function (mesg, data) {
        View.prototype.update.call(this, mesg, _.extend({}, data, this.form && this.form.getValue() || null));
    },
    template:_.template(tableTemplate),
    render:function () {
        View.prototype.render.apply(this, arguments);
        if (this.model && this.model.schema) {
            var buttons = this.model.buttons;
            collection.finder = this.model;
            var form = this.form.render();
            var $div = $('<div class="form-actions"><input type="reset" class="btn" value="Clear"></div>');
            console.log('btns', buttons);
            var btns = _.map(buttons, function (v) {
                console.log('buttons', v);
                if (_.isString(v)) {
                    return $(v);
                } else {
                    var $a = $(v.type || '<a></a>');
                    $a.attr('href', v.href);
                    $a.addClass(v.clsNames);
                    $a.html(v.html);
                    $a.data('data', v);
                    return $a;
                }
            });
            if (btns && btns.length) {
                if (btns.length > 1) {
                    var $d = $('<div class="btn-group pull-right"></div>');

                    $d.append.apply($d, btns);
                    $div.append($d)
                } else {
                    btns[0].addClass('pull-right');
                    $div.append.apply($div, btns);

                }

            } else {
                $div.append('<button type="submit" class="btn pull-right btn-primary save finish">Submit</button>');
            }
            form.$el.append($div);
            this.$el.find('.table').before(form.el);
        }

        this.$table.find('.title').append(" &gt; <span>${model.title}</span>")

        return this;
    },
    listItemTemplate:_.template(tableItemTemplate),
    config:{
        title:'${finder.title}',
        modelName:'${modelName}',
        plural:'${model.plural}'
    }
});
})
;
