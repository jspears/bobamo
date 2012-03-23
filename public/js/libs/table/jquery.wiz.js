(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else {
        // RequireJS isn't being used. Assume backbone is loaded in <script> tags
        factory(jQuery);
    }
}(function ($) {
    var Wizard = function (element, options) {
        this.options = $.extend({}, $.fn.sort.defaults, options)
        this.$fieldsets = $('fieldset', element);
        this.$el = $(element);
        this.$el.prepend('<ul class="nav nav-tabs nav-stacked steps"></ul>');
        this.$el.addClass('tabbable tabs-left');
        var $ul = this.$ul = $('.steps',this.$el);
        this.$fieldsets.each(function(i,e){
            var l = i;
            $(this).addClass('tab-pane').data('step',l);
            var html = $('legend', this).html() || 'Step '+(i+1);
            var $li = $('<li><a  class="step" href="#tab">'+html+'</a></li>').data('step',l);
            $ul.append($li)
        });
        var self = this;
        this.$el.on('click', 'a.step', function(e){
            e.preventDefault();
            e.stopPropagation();
            self.step($(e.currentTarget).parent().data('step'));
        } );
        this.step(0);
    }
    Wizard.prototype.step = function(pos){
        pos = pos || 0;
        this.$fieldsets.hide();
        this.$fieldsets.each(function(){
            if ($(this).data('step') == pos){
                $(this).show();
            }
        });
        $('li', this.$ul).removeClass('active').each(function(){
           var step = $(this).data('step');
            console.log('step',step, pos);
           if ( step == pos){
               $(this).addClass('active');
           }
        });
    };
    $.fn.wiz = function ( option ) {
        return this.each(function (s) {
            var $this = $(this)
                , data = $this.data('sorter')
                , options = typeof option == 'object' && option || {
//                    field:$this.attr('data-field'),
//                direction:$this.attr('data-direction'),
//                label:$this.attr('data-label')
            };
            if (!data) $this.data('sorter', (data = new Wizard(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }

    $.fn.wiz.defaults = {
        next:'Next',
        prev:'Previous',
        done:'Done'
    }

}));