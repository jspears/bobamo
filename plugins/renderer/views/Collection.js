define(['underscore', 'jquery'], function (_, $) {
    var conf//${nl()} = {{json model.defaults || {} }}
    return function (options) {
        options = _.extend({}, conf.default, options);
        var collection = options.collection;
        var Collection = new $.Deferred();
        require(['modelcollections/' + collection], function (C) {
            var c = new C.Collection();
            if (c.length == 0)
                c.fetch();
            Collection.resolve(c);
        })
        return function (value) {
            var $el = this.$el;

            function update(v) {
                $el.html(v && v.toString() || value);
            }

            if (value) {
                $.when(Collection).then(function (c) {
                    var v = c.get(value);
                    if (v) update(v);
                    new c.model({id: value}).fetch({
                        success: function (v) {
                         //   if (!c.get(value))
                                c.add(v);
                            update(v);
                        }
                    });

                });
            }
        }
    }
})
