define(['underscore', 'Backbone', 'Backbone.Form'], function (_, B, Form) {
    _.extend(Form.templates, {
        listItemReorder: Form.helpers.compileTemplate('<li class="edit-item-li">\
            <div class="bbf-editor-container">\{\{editor\}\}</div>\
            <div class="edit-control">\
                 <button type="button" data-action="remove" class="bbf-remove"><i class="icon-remove"></i></button>\
                 <button type="button" data-action="moveUp" class="bbf-moveUp"><i class="icon-chevron-up"></i></button>\
                 <button type="button" data-action="moveDown" class="bbf-moveDown"><i class="icon-chevron-down"></i></button>\
            </div>\
            <div class="clearfix"> </div>\
      </li>'),
        nestedField: Form.helpers.compileTemplate('\
            <div class="control-group nested field-{{key}}">\
                <label class="control-label" for="{{id}}">{{title}}</label>\
                 {{editor}}\
                <span class="help-inline">{{error}}</span>\
                <span class="help-block">{{help}}</span>\
            </div>\
          ')
    });
    var swapItems = function (list, a, b) {
        list[a] = list.splice(b, 1, list[a])[0];
        return list;
    }
    //Sorry about this, but gotta patch it somewhere.
    var LIP = Form.editors.List.Item.prototype;
    var oremove = LIP.remove;
    LIP.remove = function () {
        this.$el.remove();
        oremove.call(this);
    };
    _.extend(LIP.events, {
        'click [data-action="moveUp"]': function (event) {
            event.preventDefault();
            this.$el.insertBefore(this.$el.prev());
            var list = this.list, items = list.items, idx = items.indexOf(this);
            swapItems(items, idx - 1, idx);
            list.trigger('change', this);
        },
        'click [data-action="moveDown"]': function (event) {
            event.preventDefault();
            this.$el.insertAfter(this.$el.next());
            var list = this.list, items = list.items, idx = items.indexOf(this);
            swapItems(items, idx, idx + 1);
            list.trigger('change', this);
        }

    })
    Form.editors.ReorderList = Form.editors.List.extend({

    });
    return  Form.editors.ReorderList

});