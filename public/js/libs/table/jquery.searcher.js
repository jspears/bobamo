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
        this.$element = $(element)
        if (o.fields)
            if (! $.isArray(o.fields)) {
                o.fields = o.fields.split(comma);
            } else {
                this.$element.attr('data-fields', o.fields.join(','));
            }
        if (o.labels)
            if (! $.isArray(o.labels)) {
                o.labels = o.labels.split(comma);
            } else {
                this.$element.attr('data-labels', o.labels.join(','));

            }

        var $pel = this.$el = $('<form class="form-search"><input type="text" class="input-medium search-query"><div class="btn-group" data-toggle="buttons-checkbox"></div></form>')
        this.$controls = $('.btn-group', $pel);
        $('input', $pel).attr('placholder', this.options.placeholder);
        var $ele = $(element);
        $ele.delegate('input[type=checkbox]', 'click ', $.proxy(this.change, this));
        $ele.append(this.$el);
        this.drawLabels();
    };

    Searcher.prototype = {
        constructor:Searcher,
        change:function () {
            console.log('change');
        },
        drawLabels:function () {
            console.log('options', this.options);
            var labels = this.options.labels || [], fields = this.options.fields || [];
            console.log('labels',labels,'fields',fields);
            for (var i = 0, l = Math.max(labels.length, fields.length); i < l; i++) {
                var label = (i<labels.length) ? labels[i] : fields[i];
                var field = (i<fields.length) ? fields[i] : labels[i];
                this.$controls.append('<a class="btn  btn-mini"  data-field="' + field + '">' + label + '</a>');
            }
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