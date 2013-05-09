
/**
 * Initialize the view rendering. Instead of doing it manually, were
 * going to batch the rendering from within the runloop so that bindings
 * have time to propagate and all the values are up-to-date.
 *
 * XXX: Maybe call this `boot` (since `init` is for `new X`).
 */

exports.init = function(){
  exports.emit('init');
  exports.initializeChildren(true);
};

/**
 * Global render function that outsources most of the work
 * to the individual views. Bindings can, however, be outside
 * a view and thus need to be handled at a global scope.
 *
 * This method is called by the runloop to ensure that all
 * bindings are bound correctly with new values.
 *
 * @return {Boolean}
 */

exports.render = function(){
  // Let everyone know that were rendering.
  exports.emit('before render');

  // XXX Render Logic

  // Begin with the global view ('body') and render inwards.
  exports('body').render();

  // XXX End of Render Logic

  // Let everyone know that were done rendering.
  exports.emit('after render');
  return true;
};

exports.find = function(elem, child, parent){
  var views = []
    , attr = '[view]:not([each],[data-each])'
    , _elem = elem;

  elem = true === elem
    ? $(attr)
    : elem.find(attr);

  elem.filter(function(){
    var each = $(this).parents('[data-each],[each]');
    if (!!each) return false;
    // XXX: This is the slower method.
    if (child && parent) {
      var p = $(this).parents('[view=' + parent.name + ']').length;
      return !!p;
    }

    return true !== _elem
      ? $(this).find(attr).length
      : !$(this).parents(attr).length;
  }).each(function(){
    var elem = $(this)
      , name = elem.attr('view');

    views.push({
        name: name
      , elem: elem
    });
  });

  return views;
}

exports.initializeChildren = function(){
  var views = exports.find.apply(exports, arguments);

  views.forEach(function(_view){
    view(_view.name).elem.push({
        name: _view.name
      , elem: _view.elem
      , ready: true
    });
    view(_view.name).init();
  });
};