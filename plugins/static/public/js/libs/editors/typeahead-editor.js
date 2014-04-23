define(['Backbone.Form', 'jquery', 'underscore', 'libs/bootstrap/js/bootstrap-typeahead'], function (Form, $, _) {
    "use strict";
    var pslice = Array.prototype.slice;
    var editors = Form.editors;
    var Select = editors.Select;
    var Item = function (itm) {
        this.value = itm;
        if (_.isString(itm)) {
            this.str = itm;
        } else if (itm.label) {
            this.str = itm.label;
        } else if (itm.toString) {
            this.str = itm.toString();

        } else {
            this.str = (_.isUndefined(itm)) ? "" : '' + itm;
        }

    }

    _.extend(Item.prototype, {
        indexOf:function () {
            var str = this.toString();
            var idx = str.indexOf.apply(str, _.toArray(arguments));
            return idx;
        },
        toString:function () {
            return this.str;
        },
        replace:function () {
            var str = this.toString();
            return str.replace.apply(str, _.toArray(arguments))
        },
        toLowerCase:function () {
            return this.toString().toLowerCase();
        }
    })

    var TypeAhead = editors.Typeahead = editors.TypeAhead = Select.extend({
        tagName:'input',
        dataType:'text',
        // clsNames:'typeahead',
        //events:{},
        mapOptions:function (opt, cb) {
            cb(_.map(opt, function (v) {
                return new Item(v)
            }));
        },
        setValue:function(value){
          return Select.prototype.setValue.apply(this, pslice.call(arguments));
        },
        setOptions: function(options, opt, cb) {
            var self = this;
            cb = cb || _.bind(this.renderOptions, this);
            //If a collection was passed, check if it needs fetching
            if (typeof options == "string"){
                require([this.schema.collection], function(collection){
                    self.setOptions(collection, opt, cb);
                });

            }else if (options instanceof Backbone.Collection) {
                var collection = options;
                    collection.fetch({
                        data:opt,
                        success:function(resp){
                            self.mapOptions(resp.models, cb);
                        }
                    });
            }

            //If a function was passed, run it to get the options
            else if (_.isFunction(options)) {
                options(cb);
            }

            //Otherwise, ready to go straight to renderOptions
            else {
             self.mapOptions(options, cb);
            }
        },

        render:function () {
            this.$el.attr('type', this.options.dataType || this.dataType);
            this.$el.val(this.value || this.options.value);
            var self = this;
            var $el = this.$el.parent();
            var schema = this.schema;
            var search = this.options.schema.search;

            this.$el.typeahead({
                source:function onSourceMap(opt, cb) {
                    if (search){
                        var o = {};
                        o[search] = opt;
                        opt = o;
                    }
                    var options;
                    if (schema.url){
                        options = function(cb){
                            $.ajax({url:schema.url, data:opt, success:cb})
                        }
                    }else if (schema.collection){
                        options = schema.collection;
                    }else if (schema.options){
                        options = schema.options;
                    }

                    self.setOptions(options, opt, cb);
                },

                container:$el
            })
            return this;
        },
        renderOptions:function (options) {
            this._options = options;
        }
    });
    return TypeAhead;

})