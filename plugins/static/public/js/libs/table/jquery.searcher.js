(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery', 'libs/bootstrap/js/bootstrap-button'], factory);
    } else {
        // RequireJS isn't being used. Assume backbone is loaded in <script> tags
        factory(jQuery);
    }
}(function ($) {
    var comma = /,/g;

    var Searcher = function (element, options) {

        this.options = $.extend({}, $.fn.searcher.defaults, options)
        var o = this.options;
        var $ele = this.$element = $(element)
        if (o.fields) {
            if (!$.isArray(o.fields)) {
                o.fields = o.fields.split(comma);
            } else {
                $ele.attr('data-fields', o.fields.join(','));
            }
        }
        if (o.labels) {
            if (!$.isArray(o.labels)) {
                o.labels = o.labels.split(comma);
            } else {
                $ele.attr('data-labels', o.labels.join(','));
            }
        }

        var $pel = this.$el = $('<form class="form-search"><input type="text" class="input-medium search-query"><div class="btn-group" data-toggle="buttons-checkbox"></div></form>')
        this.$controls = $('.btn-group', $pel);
        this.$query = $('.search-query', $pel);
        $('input', $pel).attr('placholder', this.options.placeholder);
        $ele.delegate('a.btn', 'click ', $.proxy(this.change, this));
        $ele.delegate('input[type=text]', 'blur', $.proxy(this.changeText, this))
        $ele.append(this.$el);
        this.drawLabels();
    };

    Searcher.prototype = {
        constructor:Searcher,
        changeText:function (e) {
            var v = this.$query.val();
            if (this._val != $.trim(v)) {
                this._val = v;
                this.change(e);
            }
        },
        change:function () {
            if (this._val) {
                $(this.$element).trigger({type:'search-change', query:this.activeFields()});
                console.log('change');

            }
        },
        drawLabels:function () {
            console.log('options', this.options);
            var labels = this.options.labels || [], fields = this.options.fields || [];
            console.log('labels', labels, 'fields', fields);
            for (var i = 0, f = fields.length, a = labels.length, l = Math.max(labels.length, fields.length); i < l; i++) {
                var label = (i < a) ? labels[i] : fields[i];
                var field = (i < f) ? fields[i] : labels[i];
                this.$controls.append('<a class="btn  btn-mini"  data-field="' + field + '">' + label + '</a>');
            }
        },
        activeFields:function () {
            var fields = {};
            var term = this.$query.val();
            $('.btn.active', this.$el).each(function (k, v) {
                fields[$(v).attr('data-field')] = term;
            });
            return fields;
        }
    };

    $.fn.searcher = function (option) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.each(function (s) {
            var $this = $(this)
                , data = $this.data('searcher')
                , options = typeof option == 'object' && option || {fields:$this.attr('data-fields'), labels:$this.attr('data-labels')};

            if (!data)
                $this.data('searcher', (data = new Searcher(this, options)))
            if (typeof option == 'string')
                return data[option].apply(data, args);

        })

    }

    $.fn.searcher.defaults = {
        fields:[],
        labels:[],
        paceholder:'Search'
    }

    $.fn.searcher.Constructor = Searcher;
    return $;

}))