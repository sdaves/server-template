
/**
 * Module dependencies.
 */

var Emitter  = require('tower-emitter')
  , Binding  = require('tower-data-binding')
  , Mixin    = require('part-mixin')
  , run      = require('tower-run-loop')
  , context  = require('./lib/context');

/**
 * Push a new render queue to the runloop.
 */

run.queues.push('render');

/**
 * Expose `view`.
 */

exports = module.exports = view;

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
      name: name
    , elem: elem
    // XXX: Not sure if `rendered` should mean visible or ready
    //      I'm currently setting it as visible.
    , state: ('body' === name) ? 'rendered' : 'not rendered'
  });

  view.emit('defined', instance);

  return exports.views[name] = instance;
}

/**
 * Clear all the registered views, events, and contexts.
 */

view.clear = function() {
  exports.views = {};
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
view.render = function() {
  // Let everyone know that were rendering.
  view.emit('before rendering');

  // XXX Render Logic


  // XXX End of Render Logic

  // Let everyone know that were done rendering.
  view.emit('after rendering');
  return true;
};

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
 *
 *
 *
 */

view.init = function(){
  view.emit('init');


  // Loop through each view that's rendered.


  // Find all the non-rendered views and their instance.
  /**$(document).find('script[type="text/view"]').each(function(){
    var elem = $(this)
      , name = elem.attr('name');

    view(name)._state('not rendered');
    view(name).elem = elem;
  });

  $(document).find('[view]').each(function(){
    var elem = $(this)
      , name = elem.attr('view');

    // Set the state to `rendered`
    view(name)._state('rendered');
    view(name).elem = elem;
  });

  var bodyView = view('body');

  function recurseViews(viewObj, parent) {
    if (!parent) parent = viewObj;

    if ('not rendered' === viewObj.state) {
      parent.elem.append(viewObj.elem);
    }

    if (viewObj.hasChildren()) {
      for (var key in viewObj.children) {
        var child = viewObj.children[key];
        recurseViews(child, parent);
      }
    }
  }

  recurseViews(bodyView);**/
};

/**
 * View constructor.
 *
 * @param {Object} options
 */

function View(options) {
  this.name = options.name;
  this.children = [];
  this.state = options.state || 'not rendered';
  this.elem = $(options.elem) || null;
  this.swapContainers = [];
  this.rendering = false;
  this.renderable = false;
  this.initialized = false;

  if ('body' === this.name) {
    this.elem = $('body');
  }

  this.init();
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

View.prototype.init = function() {

  if (!this.initialized) {
    this.initialized = true;
    this.emit('init', this);

    if (!this.elem) {
      this.elem = $('[view="' + this.name + '"]');
    }

    var parent = this.elem.parent('script[type="text/view"]');

    if (!parent.html()) {
      this.rendered = true;
      this.state = 'rendered';
    } else {
      this.rendered = false;
      this.state = 'not rendered';
    }


  }

  return this;
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

View.prototype.render = function() {
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
 * Swap a view with another view.
 *
 * @param {String} from View to swap
 * @param {String} to   View to replace with.
 */

View.prototype.swap = function(from, to){

  if (this.swapContainers[from]) {
    this.swapContainers[from] = view(to);
    // XXX: Either force a render of that area (simply swapping & binding)
    //      or batch it for the next render cycle.
  }

  this.children[from] = view(to);
  return this;
};