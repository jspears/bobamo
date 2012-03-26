define(['jquery'], function ($) {
    var Paginate = function (element, options) {
        this.options = $.extend({}, $.fn.paginate.defaults, options);

        this.$el = $('<div class="btn-toolbar"></div>')
        this.$message = $('<div class="message well"></div>');
        this.$buttonGrp = $('<div class="btn-group"></div>');
        this.$buttonGrp2 = $('<div class="btn-group"></div>');
        this.$buttonGrp3 = $('<div class="btn-group"></div>');
        this.$el.append(this.$buttonGrp, this.$buttonGrp2, this.$buttonGrp3);
        this.$el.delegate('.btn-group a.btn', 'click', $.proxy(this.onClick, this));
        this.$element = $(element).append(this.$el, this.$message);
        if (this.options.total) {
            this.drawButtons();
        }
        this.drawMessage();
    }

    Paginate.prototype = {
        destroy:function(){
            console.log("destroy",this);
          this.$el.remove();
        },
        constructor:Paginate,
        tmpl:/{([^}]*)}/g,
        /**
         * Simple replacement.
         * string template like this.
         *  var str = 'hello {world} nice to meet you {stuff} or {not}'
         *  and an object
         *  replace(str,{ world:'world', stuff:'guys', not:'else' })
         *  or
         *  replace('hello {1} to {2} {1} {3}', ['me', 'you', 'other']);
         *
         *  also works with array
         *
         *
         * @param str
         * @param opt
         */
        replace:function (str, opt) {
            var o = opt || this.options;
            var self = this;
            return str.replace(this.tmpl, function (j, k, l) {
                var v = o[k];
                if (!_d(v)) {
                    var parts = k.split(':', 2);
                    if (_d(o[parts[0]]))
                        v = o[parts[0]];
                    else if (parts.length > 1)
                        v = parts[1];
                    else
                        v = parts[0];

                }
                return $.isFunction(v) ? v.apply(self, Array.prototype.slice.call(arguments)) : v
            });
        },
        onClick:function (e) {
            var limit = this.options.limit;
            var $c = $(e.currentTarget)
            var page = $c.attr('data-page');
            $('.btn-primary', this.$el).removeClass('btn-primary');
            var skip = this.options.skip = limit * Math.max(page-1,0);
            this.$element.attr('data-skip', skip);
            this.drawButtons();
            this.makeRequest(page);

        },

        update:function (obj) {

            var total = obj.total, skip = obj.skip, limit = obj.limit, filterTotal = obj.filterTotal;
            var o = this.options;
            if (_d(skip)) {
                this.$element.attr('data-skip', skip);
            }
            if (_d(limit)) {
                this.$element.attr('data-limit', limit);
            }
            if (_d(total)) {
                this.$element.attr('data-total', total);
            }
            if (_d(filterTotal)) {
                this.$element.attr('data-filter-total', filterTotal);
            }

            $.extend(this.options, obj);
            delete this.options.payload;
            this.drawButtons();
            this.drawMessage();

        },
        drawButtons:function () {
            this.$buttonGrp.empty();
            this.$buttonGrp2.empty()
            this.$buttonGrp3.empty();
            var opts = this.options;
            var total = parseInt(_d(opts.filterTotal) ? opts.filterTotal : opts.total), limit = parseInt(opts.limit), skip = parseInt(opts.skip);
            var pageCount = Math.ceil(total / limit);
            var curpage = skip && Math.ceil(skip / limit) + 1 || 1;
            var btnTotal = 0;
            if (pageCount == 1){
                return this;
            }
            if (pageCount < 11) {
                for (var i = 1, l = pageCount; i <= l; i++) {
                    this.drawButton(this.$buttonGrp, i, i, curpage == i);
                    btnTotal = i;
                }

            } else {
                for (var i = 1, l = Math.min(pageCount, 4); i <= l; i++) {
                    this.drawButton(this.$buttonGrp, i, i, curpage == i);
                    btnTotal = i;
                }
                var end = pageCount - 4;
                if (pageCount > 4) {
                    if (pageCount > 7) {
                        var $bg = this.$buttonGrp2;
                        var cpath = curpage - 1 <= 4 ? Math.ceil(total / (limit * 2)) : curpage - 1;
                        for (var i = cpath, j = 0; i < cpath + 3; i++, j++) {
                            var $btn = this.drawButton($bg, i, i, curpage == i);
                            if (j == 0) {
                                $btn.prepend('<b class="icon-chevron-left"/>')
                            } else if (j == 2) {
                                $btn.append('<b class="icon-chevron-right"/>')

                            }
                        }
                    }
                    var $bg = this.$buttonGrp3;
                    for (var i = end + 1; i <= pageCount; i++) {
                        this.drawButton($bg, i, i, curpage == i);
                    }
                }
            }
            return this;

        },
        drawButton:function ($bg, content, page, select) {
            var $btn = $(this.options.btnTemplate).html(content);
            if (select)
                $btn.addClass('btn-primary')
            $btn.attr('data-page', page);
            $bg.append($btn)
            return $btn;
        },
        makeRequest:function (page) {
            this.$element.trigger({type:'paginate-change', page:page, total:this.options.total, limit:parseInt(this.options.limit), skip:parseInt(this.options.skip)});
            this.load({limit:this.options.limit, skip:this.options.skip})
        },
        wait:function (message) {
            this.$message.html( this.replace(message ||this.options.messages.wait));
            return this;
        },
        load:function () {//override me
        },
        drawMessage:function () {
            var messages = this.options.messages;
            var total = this.options.total;
            var fTotal = this.options.filterTotal;
            total = total ? parseInt(total) : 0;
            fTotal = fTotal ? parseInt(fTotal) : null;
            if (fTotal !== null) total = fTotal;
            if (total == 0)
                this.$message.html(this.replace(messages.none))
            else if (total == 1) {
                this.$message.html(this.replace(messages.one))

            } else if (total < 4) {
                this.$message.html(this.replace(messages.few))
            } else {
                this.$message.html(this.replace(messages.multiple));
            }
        }
    };
    function parseAttr($el, attrs) {
        attrs = $.isArray(attrs) ? attrs : Array.prototype.slice.call(arguments, 1);
        var opts = {}
        var re = /([a-z])([A-Z])/g;
        $.each(attrs, function (k, v) {
            var attr = v.replace(re, '$1-$2').toLowerCase();
            var val = $el.attr('data-' + attr);
            if (typeof val !== 'undefined')
                opts[v] = val;
        });
        return opts;
    }
    function parseAttrInt($el, attrs) {
        attrs = $.isArray(attrs) ? attrs : Array.prototype.slice.call(arguments, 1);
        var opts = {}
        var re = /([a-z])([A-Z])/g;
        $.each(attrs, function (k, v) {
            var attr = v.replace(re, '$1-$2').toLowerCase();
            var val = $el.attr('data-' + attr);
            if (typeof val !== 'undefined')
                opts[v] = parseInt(val);
        });
        return opts;
    }

    $.fn.paginate = function (option, args) {
      //  var args = Array.prototype.slice.call(arguments, 1);
        return this.each(function (s) {

            var $this = $(this)
                , data = $this.data('paginate')
                , options = typeof option == 'object' && option || $.extend({},parseAttrInt($this, 'limit', 'skip', 'total', 'filterTotal'), parseAttr($this, 'item','items'));
            if (!data) $this.data('paginate', (data = new Paginate(this, options)))
            if (typeof option == 'string') {
                data[option].call(data, args);
            }
            return data;
        });
    }
    function _d(v) {
        return !(typeof v === 'undefined' || v === null || v === 'undefined');
    }

    $.fn.paginate.defaults = {
        limit:10,
        skip:0,
        total:0,
        btnTemplate:'<a class="btn"></a>',
        sort:'',
        messages:{
            wait:'<b class="icon-wait"/>Loading...',
            none:'No {items:items} found{filter}.',
            multiple:'Displaying <b>{cskip}</b> to <b>{end}</b> of <b>{ctotal}</b> {items:items}{filter}{sort}.',
            one:'Found <b>one</b> {item:item}{filter}.',
            few:'Found <b>{count:a few}</b> {items:items}{filter}{sort}.',
            filternone:'<b class="icon-filter"/> No {items:items} found matching{filter:filter}{sort}.',
            filtermsg:',<b class="icon-search"/> filtering {fcount} {items:items}'
        },
        cskip:function(){
            var o = this.options;
          return (parseInt(o && o.skip) || 0) + 1;
        },
        ctotal:function () {
            var o = this.options;
            if (_d(o.filterTotal))
                return o.filterTotal;
            return o.total;

        },
        fcount:function () {
            var o = this.options;
            return parseInt(o.total) - parseInt(o.filterTotal);
        },
        filter:function () {
            var o = this.options;
            if (!_d(o.filterTotal)) return '';
            return this.replace(o.messages.filtermsg);
        },
        end:function () {
            var o = this.options;
            return Math.min(parseInt(o.total), parseInt(o.skip) + parseInt(o.limit));
        },
        success:function () {
        },
        error:function () {
        }
    }

    $.fn.paginate.Constructor = Paginate;

    return $;
});