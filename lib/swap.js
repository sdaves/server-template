
// XXX: we should move this into a separate module.

/**
 * Perform view swapping on the current view.
 * This will remove the current view within the swapping container.
 * The swapping container is simply a DOM element with a `data-swap`.
 *
 * @param {String} from Container
 *
 */

exports.performSwap = function(from, cached){

}

/**
 * Swap a view with another view.
 *
 * @param {String} from View to swap
 * @param {String} to   View to replace with.
 */

exports.swap = function(from, to){
  // Swap an unnamed swapping container. `.swap('viewName');
  if (1 === arguments.length) {
    to = from;

    console.log(this.swapContainers);

    // Any swapping containers will be cached under _caches
    if (this.swapContainers['__default__']) {
      this.swapContainers = view(to);

      var elem = this._caches['data-swap::__default__'];

      if (elem) {
        var parent = (elem.parent('script').length !== 0);

        // Has script tag as it's parent.
        if (parent) {

        } else {
          var clonedElem = elem.clone();
          var scriptTag = $('<script type="text/swap"></script>');
          scriptTag.html(clonedElem);

          elem.append(scriptTag);
          elem.remove();
        }
      }
    }
  } else {
    var cached = this.swapContainers[from];

    if (this.swapContainers[from]) {
      this.swapContainers[from] = view(to);
      // Perform the swap.
      this.performSwap(from, cached);
    }
  }

  //this.children[from] = view(to);
  return this;
};
