define(['Backbone', 'jQuery','Underscore', 'collections/employee', 'views/employee/list', 'text!tpl/header.html'], function (Backbone, $,_, collection, EmployeeListView, headerTmpl) {

    var HeaderView = Backbone.View.extend({

        initialize:function () {
            this.template = _.template(headerTmpl);
            this.searchResults = new collection.EmployeeCollection();
            this.searchresultsView = new EmployeeListView({model:this.searchResults, className:'dropdown-menu'});
        },

        render:function (eventName) {
            $(this.el).html(this.template());
            $('.navbar-search', this.el).append(this.searchresultsView.render().el);
            return this;
        },

        events:{
            "keyup .search-query":"search",
            "click .nav li a": "active"
        },
        active:function(e){
            var $p = $(e.target).parent();
            $p.parent().children().removeClass('active');
            $p.addClass('active')
        },
        search:function (event) {
//        var key = event.target.value;
            var key = $('#searchText').val();
            console.log('search ' + key);
            this.searchResults.findByName(key);
            setTimeout(function () {
                $('#searchForm').addClass('open');
            });
        }

    });
    return HeaderView;
});