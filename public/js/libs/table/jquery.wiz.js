(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery', 'replacer'], factory);
    } else {
        // RequireJS isn't being used. Assume backbone is loaded in <script> tags
        factory(jQuery);
    }
}(function ($, replacer) {
        var Wizard = function (element, options) {
            this.options = $.extend({}, $.fn.wiz.defaults, options)
            this.$fieldsets = $('fieldset', element);
            this.$el = $(element);
            this.$el.last().addClass('tab-content')
            this.$el.prepend('<ul class="nav nav-pills nav-stacked span3 steps" style="margin-right:1em;margin-top:1em"></ul>');
            this.$el.addClass('tab-content tabbable');
            this.current = 0;
            var $ul = this.$ul = $('.steps', this.$el);
            var titleTemplate = this.options.titleTemplate;
            var listItemTemplate = this.options.listItemTemplate;
            this.$steps = $('<li class="nav-header"></li>');
            $ul.append(this.$steps);

            this.steps = this.$fieldsets.hide().each(
                function (i, e) {
                    var l = i;
                    $(this).addClass('tab-pane').data('step', l);
                    var $legend = $('legend', this);
                    var s = i+1;
                    var html = replacer(titleTemplate, {step:s,title:$legend.html()});
                    var title = $legend.parent().attr('title');
                    if (title){
                        $legend.html(title);
                    }
                    var $li = $(replacer(listItemTemplate, {step:s, content:html})).data('step', l);
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
                if (self.current > 0)
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
            this.$steps.html(replacer(this.options.steps, {current:this.current+1, steps:this.steps}));
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
            var args = Array.prototype.slice.call(arguments, 1);
            return this.each(function (s) {
                var $this = $(this)
                    , data = $this.data('wiz')
                    , options = typeof option == 'object' && option || {
                    next:$this.attr('data-next'),
                    prev:$this.attr('data-prev'),
                    done:$this.attr('data-done'),
                    titleTemplate:$this.attr('data-title-template'),
                    listItemTemplate:$this.attr('data-list-item-template')
                };
                if (!data) $this.data('wiz', (data = new Wizard(this, options)))
                if (typeof option == 'string')
                    data[option].apply(data,args);
            })
        }

        $.fn.wiz.defaults = {
            titleTemplate:'<b>Step {step}</b>: {title}',
            listItemTemplate:'<li><a  class="step" href="#?step={step}">{content}</a></li>',
            next:'Next &raquo;',
            prev:'&laquo; Previous',
            done:'Finish',
            steps:'Step {current} of {steps}'
        }

    }
))
;