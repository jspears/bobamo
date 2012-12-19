define(['Backbone', 'jquery', 'underscore','text!tpl/header.html', 'libs/bootstrap/js/bootstrap-dropdown'], function (Backbone, $, _,  headerTmpl) {
    var item = _.template('<li class="<%=j.clsNames%>"><%if(j.href){%>'+
    '<a id="<%=j.id%>" href="<%=j.href%>"><%=j.label%></a>'+
    '<%}%></li>');


    var HeaderView = Backbone.View.extend({

        initialize:function(){
            this.headerdata = {{html JSON.stringify(appModel.header)}}

        },
        itemTemplate:function renderItem(j){
            return item({j:j});
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
            var html =     this.template({items:this.headerdata, item:this.itemTemplate});
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