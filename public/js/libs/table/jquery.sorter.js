(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else {
        // RequireJS isn't being used. Assume backbone is loaded in <script> tags
        factory(jQuery);
    }
}(function ($) {
    function doActivate($el, dir, trigger){
        $el.children().children().removeClass('activate');
        if (dir){
            $( dir > 0 ? '.up' : '.down', $el).addClass('activate');
        }
        if (isNaN(dir))
            dir = null;
        $el.attr('data-direction', dir);
        if (trigger)
            $el.trigger({type:'sorter-change', direction:isNaN(dir) ? null : dir, field:$el.attr('data-field'), label:$el.attr('data-label')});

    }
    var Sorter = function (element, options) {
        this.options = $.extend({}, $.fn.sort.defaults, options)

        var dir = this.options.direction;
        var field = this.options.field;
        var label = this.options.label;
        var $pel = this.$el = $('<div class="sorter"><b class="arrow up"/><b class="arrow down"/></div>')
        var $ele = $(element);
        $ele.delegate('b.arrow', 'click ', this.sort);
        $ele.append(this.$el);
        $ele.addClass('sortable');
        if (field){
            this.$el.attr('data-field', field);
        }
        if (!$ele.attr('data-label'))
            $ele.attr('data-label', label || $ele.text());
        if ($ele.hasClass('elementActivate')){
            $ele.on('click', function(evt){
                var dir =$ele.attr('data-direction');
                var odir = isNaN(dir) || !dir ? 1 : ( (1 + dir) % 3) -2;
                doActivate($ele,  odir, true);
            });
        }
        doActivate(this.$el, dir);
    };

    Sorter.prototype = {
        constructor:Sorter,
        sort:function (evt) {
            evt.stopPropagation();
            evt.preventDefault();
            var $cel = $(this);
            doActivate($cel.parent().parent(), $cel.hasClass('up') ? $cel.hasClass('activate')  ? 0 : 1 : -1, true);
        }
    };

    $.fn.sorter = function ( option ) {
        return this.each(function (s) {
            var $this = $(this)
                , data = $this.data('sorter')
                , options = typeof option == 'object' && option || {field:$this.attr('data-field'), direction:$this.attr('data-direction'), label:$this.attr('data-label')};
            if (!data) $this.data('sorter', (data = new Sorter(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }

    $.fn.sorter.defaults = {
        direction: null,
        field:null
    }

    $.fn.sorter.Constructor = Sorter;
    return $;

}))