define(['Backbone.Form', 'jquery', 'underscore','bootstrap/bootstrap-typeahead'], function (Form, _) {
    "use strict";
    var editors = Form.editors;
    var Select = editors.Select;
    var Item = function (itm) {
       this.value = itm;
       if (_.isString(itm)){
           this.str = itm;
       }else if (itm.label) {
           this.str = itm.label;
       }else if (itm.toString){
               this.str = itm.toString();

       }else{
            this.str = (_.isUndefined(itm)) ? "" : ''+itm;
       }

    }

    _.extend(Item.prototype, {
        indexOf:function(){
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

    editors.TypeAhead = Select.extend({
        tagName:'input',
        dataType:'text',
        // clsNames:'typeahead',
        //events:{},
        mapOptions:function(opt, cb){
            var options =_.isFunction(this.schema.options) ? this.schema.options.call(this) : this.schema.options;
            cb(_.map(options, function(v){return new Item(v) }));
        },
        render:function () {
            this.$el.attr('type', this.options.dataType || this.dataType);
            this.$el.val(this.options.value);
            this.$el.typeahead({
                source:_.bind(this.mapOptions, this)
            })
            return this;
        },
        renderOptions:function (options) {
            this._options = options;
        }
    });
    return editors;

})