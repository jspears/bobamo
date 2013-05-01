define(['underscore', 'Backbone', 'jquery'], function(_,B,$){
    function currentProperty($e) {
        var $parent = $e.parents('.control-group');
        return $parent.length ? $parent[0].className.replace(/.*field-([^\s]*).*/, "$1") : null;
    }

    function currentAction($e) {
        return $e.length ? $e[0].className.replace(/.*toolbar-([^\s]*).*/, "$1") : null;
    }

    return B.View.extend({
        events: {
            'click .btn': 'onAction'
        },
        className: 'btn-toolbar toolbar',
        initialize:function(options){
            options = options || {};
            if (options.buttons)
                this.buttons = options.buttons;
        },
        onAction: function (e) {
            if (e) e.preventDefault();
            var $e = $(e.currentTarget);
            this.trigger(currentAction($e) + '-property', currentProperty($e));
        },
        buttons: {
            'edit': {
                iconCls: 'icon-edit'
            },
            'remove': {
                iconCls: 'icon-remove'
            },
            'up': {
                iconCls: 'icon-arrow-up'
            },
            'down': {
                iconCls: 'icon-arrow-down'
            }
        },
        render: function onToolbarRender() {
            var $group = $('<div class="btn-group"></div>');
            $.fn.append.apply($group, _.map(this.buttons, function (v, k) {
                return $('<button class="btn btn-mini toolbar-' + k + '"><i class="' + v.iconCls + '"/></button>')
            }));
            this.$el.html($group);

            return this;
        }
    });

});