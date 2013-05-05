
/**
 * Module dependencies.
 */

var Emitter = require('tower-emitter')
  , binding = require('tower-data-binding').binding
  , run = require('tower-run-loop')
  , context = require('./lib/context')
  , nextTick = run.nextTick;

/**
 * Expose `view`.
 */

exports = module.exports = view;

/**
 * Expose `View`.
 */

exports.View = View;

/**
 * Expose `collection`.
 */

exports.collection = [];

/**
 * Expose `context`.
 */

exports.context = context;

/**
 * Expose `run`.
 */

exports.run = run;

/**
 * Create or retrieve an existing view.
 *
 * @param  {String} name View name
 */

function view(name, elem) {
  if (!name) throw new Error("Views need a name.");
  if (exports.collection[name]) return exports.collection[name];

  var obj = new View({
    name: name,
    elem: elem,
    // XXX: Not sure if `rendered` should mean visible or ready
    //      I'm currently setting it as visible.
    rendered: 'body' === name
  });

  exports.collection[name] = obj;
  // exports.collection.push(obj);

  exports.emit('define ' + name, obj);
  exports.emit('define', obj);

  return obj;
}

/**
 * Mixin `Emitter`.
 */

Emitter(exports);
Emitter(View.prototype);

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

/**
 * Clear all the registered views, events, and contexts.
 */

exports.clear = function(){
  exports.collection = {};
  // XXX: Maybe move this into `context.clear`?
  context.contexts = {};
};

/**
 * Instantiate a new `View`.
 *
 * @param {Object} options
 */

function View(options) {
  var self = this;

  this.name = options.name;
  this.children = [];
  this.rendered = [];
  this.elem = [];
  this.swapContainers = [];
  this.rendering = false;
  this.renderable = true;
  this.initialized = false;

  var type = typeof(options.elem);

  if ('string' === type) {
    this.elem.push({
        name: options.elem
      , elem: $(options.elem)
      , ready: true
    });
  } else if ('object' === type && options.elem.length) {
    options.elem.forEach(function(elem){
      self.elem.push({
          name: elem
        , elem: $(elem)
        , ready: true
      });
    });
  }
}

/**
 * Initialize the view instance. This will initialize all the
 * binding maps and child-views.
 *
 * @return {View}
 */

View.prototype.init = function(){
  this.checkParents();

  if (!this.initialized) {
    this.initialized = true;
    this.emit('init', this);
  }

  for (var i = 0, n = this.elem.length; i < n; i++) {
    view.initializeChildren(this.elem[i].elem, true, this);
  };

  return this;
};

/**
 * Check if the parents are of an iteration loop.
 * Set false to the elements ready key.
 *
 * XXX: This is being overwritten by the `view.find` method that
 *      does the same thing but instead, never loads the view's
 *      initialization, which might be better.
 */

View.prototype.checkParents = function(){
  var self = this;

  this.elem.forEach(function(obj, i){
    if (!! obj.elem.parent('[data-each],[each]').length) {
      self.elem[i].ready = false;
    }
  });
};

/**
 * Create a new child view.
 *
 * @param {String} name View name
 */

View.prototype.child = function(name){
  if (this.children[name]) return this;
  this.children.push(this.children[name] = view(name));
  return this;
};

/**
 * Return true if the view has any child views
 *
 * @return {Boolean}
 */

View.prototype.hasChildren = function(){
  return !!this.children.length;
};

/**
 * Render the current view and apply all it's bindings.
 *
 * @return {View}
 */

View.prototype.render = function(){
  // Cannot render this view as it doesn't need to be
  // rendered. This typicall means it's not activated yet (
  // i.e within a script tag.)
  if (!this.renderable) return false;

  // Let everyone know were rendering.
  this.rendering = true;
  // Emit that were rendering.
  this.emit('before render', this);

  // XXX Render Logic
  this.emit('render', this);
  // XXX End of Render Logic

  // Were done rendering.
  this.rendering = false;
  // Let everyone know that.
  this.emit('after render', this);

  return this;
};

/**
 * Perform view swapping on the current view.
 * This will remove the current view within the swapping container.
 * The swapping container is simply a DOM element with a `data-swap`.
 *
 * @param {String} from Container
 *
 */

View.prototype.performSwap = function(from, cached){

}

/**
 * Swap a view with another view.
 *
 * @param {String} from View to swap
 * @param {String} to   View to replace with.
 */

View.prototype.swap = function(from, to){
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

/**
 * Dom selector where event handling is delegated.
 *
 * @param {String} name
 */

View.prototype.dispatcher = function(name){
  this._dispatcher = name;
  return this;
}

/**
 * Push a new render queue to the runloop.
 */

run.queues.push('render');

/**
 * Add a permanent action to the `render` queue.
 */

run.add('render', nextTick, null, [view.render]);