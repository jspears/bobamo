/*!
 * jQuery Farthest Decendant - v0.2pre - 6/1/2011
 * http://benalman.com/
 *
 * Copyright (c) 2011 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

;(function($) {

  // Handle alternate spellings (but of course).
  $.fn.farthestDecendant = $.fn.furthestDecendant = function(selector) {
    // Since the result set needs to contain the farthest descendant for each
    // of the initial elements, iterate over all initial elements using .map,
    // which not only returns a new jQuery collection, but is .end-able.
    return this.map(function() {
      // An array of all descendant elements of this initial element, indexed by
      // their depth.
      var elems = [];
      // Recursively walk the DOM, starting at the initial element.
      walk(this, function(depth) {
        // For each depth, get (or create) an array, indexed by that depth.

        // If the depth is non-zero (zero is the initial element), the node is
        // an element node, and either a selector is not passed (match all
        // elements) or a selector IS passed AND the element matches the
        // selector, push this element onto the array.
        if ( depth && this.nodeType == 1 && (!selector || $(this).is(selector)) ) {
          var arr = elems[depth] || (elems[depth] = []);
          arr.push(this);
        }
      });
      // The farthest descendant(s) are all the elements in the array at the
      // last index (deepest depth) of the `elems` array. Add them onto the
      // result set.
      return elems.pop();
    });
  };

  // Small Walker: A small and simple JavaScript DOM walker
  // https://gist.github.com/958000
  function walk(node, callback) {
    var skip, tmp;
    // This depth value will be incremented as the depth increases and
    // decremented as the depth decreases. The depth of the initial node is 0.
    var depth = 0;

    // Always start with the initial element.
    do {
      if ( !skip ) {
        // Call the passed callback in the context of node, passing in the
        // current depth as the only argument. If the callback returns false,
        // don't process any of the current node's children.
        skip = callback.call(node, depth) === false;
      }

      if ( !skip && (tmp = node.firstChild) ) {
        // If not skipping, get the first child. If there is a first child,
        // increment the depth since traversing downwards.
        depth++;
      } else if ( tmp = node.nextSibling ) {
        // If skipping or there is no first child, get the next sibling. If
        // there is a next sibling, reset the skip flag.
        skip = false;
      } else {
        // Skipped or no first child and no next sibling, so traverse upwards,
        tmp = node.parentNode;
        // and decrement the depth.
        depth--;
        // Enable skipping, so that in the next loop iteration, the children of
        // the now-current node (parent node) aren't processed again.
        skip = true;
      }

      // Instead of setting node explicitly in each conditional block, use the
      // tmp var and set it here.
      node = tmp;

    // Stop if depth comes back to 0 (or goes below zero, in conditions where
    // the passed node has neither children nore next siblings).
    } while ( depth > 0 );
  }

})(jQuery);