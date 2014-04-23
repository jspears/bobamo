/*
 * jQuery-busy v1.0.6
 * Copyright 2010-2012 Tomasz Szymczyszyn
 *
 * This plug-in is dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */
(function($) {
  // Helper object factory 
  function Busy(options) {
    this.options = $.extend({}, Busy.defaults, options);
  };

  // Remembers currently "busied" targets along with options
  Busy.instances = [];

  Busy.repositionAll = function() {
    for (var i = 0; i < Busy.instances.length; i++) {
      if (! Busy.instances[i])
        continue;

      var options = Busy.instances[i].options;
      new Busy(options).positionImg($(Busy.instances[i].target), $.data(Busy.instances[i].target, "busy"), options.position);
    }
  };

  Busy.prototype.hide = function(targets) {
    targets.each(function() {
      var busyImg = $.data(this, "busy");
      if (busyImg)
        busyImg.remove();

      $(this).css("visibility", "");

      $.data(this, "busy", null);
      for (var i = 0; i < Busy.instances.length; i++)
        if (Busy.instances[i] != null && Busy.instances[i].target == this)
          Busy.instances[i] = null;
    });
  };

  Busy.prototype.show = function(targets) {
    var that = this;

    targets.each(function() {
      if ($.data(this, "busy"))
        return;

      var target = $(this);

      var busyImg = that.buildImg();
      busyImg.css("visibility", "hidden");
      busyImg.load(function() { 
        that.positionImg(target, busyImg, that.options.position);
        busyImg.css("visibility", "");
        busyImg.css("zIndex", that.options.zIndex);
      });

      that.positionImg(target, busyImg, that.options.position);

      $("body").append(busyImg);

      if (that.options.hide)
        target.css("visibility", "hidden");

      $.data(this, "busy", busyImg);
      Busy.instances.push({ target : this, options : that.options });
    });
  };

  Busy.prototype.preload = function() {
    var busyImg = this.buildImg();
    busyImg.css("visibility", "hidden");
      busyImg.load(function() {
        $(this).remove();
      });

      $("body").append(busyImg);
  };

  // Creates image node, wraps it in $ object and returns.
  Busy.prototype.buildImg = function() {
    var html = "<img src='" + this.options.img + "' alt='" + this.options.alt + "' title='" + this.options.title + "'";

    if (this.options.width)
      html += " width='" + this.options.width + "'";
   
    if (this.options.height)
      html += " height='" + this.options.height + "'";

    html += " />";

    return $(html);
  };

  Busy.prototype.positionImg = function(target, busyImg, position) {
    var targetPosition = target.offset();
    var targetWidth = target.outerWidth();
    var targetHeight = target.outerHeight();

    var busyWidth = busyImg.outerWidth();
    var busyHeight = busyImg.outerHeight();

    if (position == "left") {
      var busyLeft = targetPosition.left - busyWidth - this.options.offset;
    }
    else if (position == "inner-left") {
      var busyLeft = targetPosition.left;
    }
    else if (position == "right") {
      var busyLeft = targetPosition.left + targetWidth + this.options.offset;
    }
    else if (position == "inner-right") {
      var busyLeft = targetPosition.left + targetWidth - busyWidth - this.options.offset;
    }
    else {
      var busyLeft = targetPosition.left + (targetWidth - busyWidth) / 2.0;
    }

    var busyTop = targetPosition.top + (targetHeight - busyHeight) / 2.0;

    busyImg.css("position", "absolute");
    busyImg.css("left", busyLeft + "px");
    busyImg.css("top", busyTop + "px");
  };

  Busy.defaults = {
    img : 'busy.gif',
    alt : 'Please wait...',
    title : 'Please wait...',
    hide : true,
    position : 'center',
    zIndex : 1001,
    width : null,
    height : null,
    offset : 10
  };

  $.fn.busy = function(options, defaults) {
    if ($.inArray(options, ["clear", "hide", "remove"]) != -1) {
      // Hide busy image(s)
      new Busy(options).hide($(this));     
    }
    else if (options == "defaults") {
      // Overwrite defaults
      $.extend(Busy.defaults, defaults || {});
    }
    else if (options == "preload") {
      // Preload busy image
      new Busy(options).preload();
    }
    else if (options == "reposition") {
      // Update positions of all existing busy images
      Busy.repositionAll();
    }
    else {
      // Show busy image(s)
      new Busy(options).show($(this));
    }
    return $(this);
  };
})(jQuery);
