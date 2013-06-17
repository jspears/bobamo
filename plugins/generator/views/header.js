define(['Backbone', 'jquery', 'underscore', 'passport/views/login-state', 'text!tpl/header.html', 'libs/bootstrap/js/bootstrap-dropdown'], function (Backbone, $, _, state, headerTmpl) {
    console.log('state', state);
    var item = _.template('<li role="presentation" class="<%=j.clsNames%>"><%if(j.href){%>' +
        '<a role="menuitem" id="<%=j.id%>" href="<%=j.href%>" tabindex="-1"><%if (j.iconCls && j.iconCls.length){%>' +
        '<i class="<%=j.iconCls%>"/>' +
        '<%}%><%=j.label%></a>' +
        '<%}%></li>');

    var menu = _.template('<% if (l.items && l.items.length){ %>' +
        ' <li class="dropdown <%=l.clsNames%>" id="<%=l.id%>">' +
        ' <a role="button" class="dropdown-toggle" data-toggle="dropdown">' +
        '<i class="<%=l.iconCls%>"/>' +
        '       <%=label%> ' +
        '           <b class="caret"></b>                             ' +
        '       </a>                                                    ' +
        '       <ul class="dropdown-menu" role="menu">                                ' +
        '       <% _.each(l.items, function(j,k){ %>  ' +
        '           <%=item(j)%>                                              ' +
        '           <%})%>                                                      ' +
        '           </ul> ' +
        ' <% } else {%>' +
        '       <%=item(l)%>' +
        '      <%}%></li>');

    var HeaderView = Backbone.View.extend({

        initialize: function () {
            this.headerdata//${nl} = {{json appModel.header }}
            state.on('loggedin', this.showAdmin.bind(this));

        },
        showAdmin: function () {
            var $el = this.$el.find('#admin-menu');
            var show =state.isAuthenticated;
            $el.toggle(show);
            this.$el.toggleClass('authenticated', state.isAuthenticated);
        },
        itemTemplate: function renderItem(j) {
            return item({j: j});
        },
        menuTemplate: function renderMenu(l, label) {
            if (l.items && !_.isArray(l.items)) {
                l.items = _.values(l.items);
            }
            return menu({l: l, label: label || l.label, item: this.itemTemplate})
        },
        template: _.template(headerTmpl),
        fetch: function () {
            var self = this;
            $.getJSON('${baseUrl}js/appModel/header', function (resp) {
                self.headerdata = resp.payload;
                self.render();
            })
        },
        render: function (eventName) {
            var $el = $(this.el);
            var html = this.template({items: this.headerdata, menu: _.bind(this.menuTemplate, this), item: this.itemTemplate});
            $el.html(html);
            this.showAdmin();
            return this;
        },

        active: function (e) {
            var $p = $(e.target).parent();
            $p.parent().children().removeClass('active');
            $p.addClass('active')
        }
    });
    return HeaderView;
});