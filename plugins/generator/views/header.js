define(['Backbone', 'jquery', 'underscore','text!tpl/header.html', 'libs/bootstrap/js/bootstrap-dropdown'], function (Backbone, $, _,  headerTmpl) {
    var item = _.template('<li class="<%=j.clsNames%>"><%if(j.href){%>'+
    '<a id="<%=j.id%>" href="<%=j.href%>"><%if (j.iconCls && j.iconCls.length){%>'+
        '<i class="<%=j.iconCls%>"/>'  +
        '<%}%><%=j.label%></a>'+
    '<%}%></li>');

    var menu = _.template('<% if (l.items && l.items.length){ %>' +
        ' <li class="dropdown <%=l.clsNames%>" id="<%=l.id%>">'+
 ' <a class="dropdown-toggle" data-toggle="dropdown">'+
        '<% if(l.iconCls && l.iconCls.length){%>' +
        '<i class="<%=l.iconCls%>"/>' +
        '<%}%>                                       '+
        '       <%=label%> ' +
 '           <b class="caret"></b>                             '+
 '       </a>                                                    '+
 '       <ul class="dropdown-menu">                                '+
 '       <% _.each(l.items, function(j,k){ %>                        '+
 '           <%=item(j)%>                                              '+
 '           <%})%>                                                      '+
 '           </ul> '+
 '           </li><% } else {%>'+
 '       <%=item(l)%>'+
  '      <%}%>');

    var HeaderView = Backbone.View.extend({

        initialize:function(){
            this.headerdata = {{html JSON.stringify(appModel.header)}}

        },
        itemTemplate:function renderItem(j){
            return item({j:j});
        },
        menuTemplate:function renderMenu(l,label){
            if (l.items && !_.isArray(l.items)){
                l.items  = _.values(l.items);
            }
            return menu({l:l, label:label || l.label, item:this.itemTemplate})
        },
        template:_.template(headerTmpl),
        fetch:function(){
            var self = this;
            $.getJSON('${baseUrl}js/appModel/header', function(resp){
                self.headerdata = resp.payload;
                self.render();
            })
        },
        render:function (eventName) {
            var $el = $(this.el);
            var html =     this.template({items:this.headerdata, menu:_.bind(this.menuTemplate, this), item:this.itemTemplate});
            $el.html(html);
            return this;
        },

        active:function (e) {
            var $p = $(e.target).parent();
            $p.parent().children().removeClass('active');
            $p.addClass('active')
        }
    });
    return HeaderView;
});