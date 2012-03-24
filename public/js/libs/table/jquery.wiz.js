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
            this.options = $.extend({}, $.fn.wiz.defaults, options)
            this.$fieldsets = $('fieldset', element);
            this.$el = $(element);
            this.$el.last().addClass('tab-content')
            this.$el.prepend('<ol class="nav nav-tabs steps"></ol>');
            this.$el.addClass('tab-content tabbable');
            this.current = 0;
            var $ul = this.$ul = $('.steps', this.$el);
            this.steps = this.$fieldsets.hide().each(
                function (i, e) {
                    var l = i;
                    $(this).addClass('tab-pane').data('step', l);
                    var html = 'Step ' + (i + 1) + ': ' + $('legend', this).html();
                    var $li = $('<li><a  class="step" href="#tab">' + html + ' </a></li>').data('step', l);
                    $ul.append($li)
                }).length;
            var $btns = $('<div class="btn-group pull-right"></div>').append(
                            (this.$prev = $('<button class="btn prev">'+this.options.prev+'</button>')),
                            (this.$next = $('<button class="btn next btn-primary">'+this.options.next+'</button>')))
            if (this.options.replace)
                $(this.options.replace).replaceWith($btns);
            else
                this.$el.append($btns);

            var self = this;
            this.$prev.on('click',  function (e) {
                self.step(self.current - 1);
            });
            this.$next.on('click',  function (e) {
                if (self.current + 1 < self.steps ){
                    self.step(self.current + 1);
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
            this.$el.on('click', 'a.step', function (e) {
                e.preventDefault();
                e.stopPropagation();
                self.step($(e.currentTarget).parent().data('step'));
            });
            this.step(0);
        }
        Wizard.prototype.step = function (pos) {
            pos = pos || 0;
            this.current = pos;
            var isFin = pos == (this.steps - 1);
            this.$next.toggleClass('save', isFin).html( isFin ? this.options.done : this.options.next);

            this.$prev[pos == 0 ? 'addClass' : 'removeClass']('disabled')

            this.$fieldsets.hide().each(function () {
                if ($(this).data('step') == pos) {
                    $(this).show('slide');
                }
            });


            $('li', this.$ul).removeClass('active').each(function () {
                if ($(this).data('step') == pos)
                    $(this).addClass('active');

            });
        }
        ;
        $.fn.wiz = function (option) {
            return this.each(function (s) {
                var $this = $(this)
                    , data = $this.data('wiz')
                    , options = typeof option == 'object' && option || {
//                    field:$this.attr('data-field'),
//                direction:$this.attr('data-direction'),
//                label:$this.attr('data-label')
                };
                if (!data) $this.data('wiz', (data = new Wizard(this, options)))
                if (typeof option == 'string') data[option]()
            })
        }

        $.fn.wiz.defaults = {
            next:'Next &raquo;',
            prev:'&laquo; Previous',
            done:'Finish'
        }

    }
))
;