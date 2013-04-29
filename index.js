
/**
 * Module dependencies.
 */

var Emitter = require('tower-emitter')
  , binding = require('tower-data-binding').binding
  , Mixin = require('part-mixin')
  , run = require('tower-run-loop')
  , context = require('./lib/context')
  , nextTick = run.nextTick;

/**
 * Push a new render queue to the runloop.
 */

run.queues.push('render');

/**
 * Expose `view`.
 */

exports = module.exports = view;

/**
 * Expose `run` for ease of use.
 *
 * @type {Function}
 */

exports.run = run;

/**
 * Registry of all the views.
 *
 * @type {Object}
 */

exports.views = {};

/**
 * Export the context module.
 *
 * @type {Context}
 */

exports.context = context;

/**
 * Create or retrieve an existing view.
 *
 * @param  {String} name View name
 */

function view(name, elem) {
  if (!name) throw new Error("Views need a name.");

  if (exports.views[name]) return exports.views[name];

  var instance = new View({
    name: name,
    elem: elem
    // XXX: Not sure if `rendered` should mean visible or ready
    //      I'm currently setting it as visible.
    ,
    rendered: 'body' === name
  });

  view.emit('defined', instance);

  return exports.views[name] = instance;
}

/**
 * Clear all the registered views, events, and contexts.
 */

view.clear = function(){
  exports.views = {};
  // XXX: Maybe move this into `context.clear`?
  context.contexts = {};
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

view.render = function(){
  // Let everyone know that were rendering.
  view.emit('before rendering');

  // XXX Render Logic

  // Begin with the global view ('body') and render inwards.
  view('body').render();

  // XXX End of Render Logic

  // Let everyone know that were done rendering.
  view.emit('after rendering');
  return true;
};

/**
 * Add a permanent action to the `render` queue.
 */

run.add('render', nextTick, null, [view.render]);

/**
 * Mixin an Emitter
 *
 * @type {Mixin}
 */

Emitter(view);

/**
 * Initialize the view rendering. Instead of doing it manually, were
 * going to batch the rendering from within the runloop so that bindings
 * have time to propagate and all the values are up-to-date.
 */

view.init = function(){
  view.emit('init');
  view.initializeChildren(true);
};


view.find = function(elem, child, parent){
  var views = []
    , target_attr = '[view]:not([each],[data-each])'
    , _elem = elem;

  if (elem === true) {
    elem = $(target_attr);
  } else {
    elem = elem.find(target_attr);
  }

  elem.filter(function(){
    var each = $(this).parents('[data-each],[each]');
    if (!!each) return false;
    // XXX: This is the slower method.
    if (child && parent) {
      var p = $(this).parents('[view=' + parent.name + ']').length;
      return !!p;
    }
    if (_elem !== true)
      return $(this).find(target_attr).length;
    else
      return !$(this).parents(target_attr).length;
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

view.initializeChildren = function(){
  var views = view.find.apply(view, arguments);

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
 * Mixin the Emitter class
 */

Emitter(View.prototype);

/**
 * Initialize the view instance. This will initialize all the
 * binding maps and child-views.
 *
 * @return {View}
 */

View.prototype.init = function(){
  var self = this;

  this.checkParents();

  if (!this.initialized) {
    this.initialized = true;
    this.emit('init', this);
  }

  this.elem.forEach(function(elem){
    view.initializeChildren(elem.elem, true, self);
  });

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
  this.emit('before rendering', this);

  // XXX Render Logic



  // XXX End of Render Logic

  // Were done rendering.
  this.rendering = false;
  // Let everyone know that.
  this.emit('after rendering', this);

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

          console.log(1);
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