
/**
 * Module dependencies.
 */

var Emitter  = require('tower-emitter')
  , Binding  = require('tower-data-binding')
  , Mixin    = require('part-mixin')
  , run      = require('tower-run-loop')
  , context  = require('./lib/context');

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

  if ('body' === this.name) {
    this.elem = $('body');
  }
}

Emitter(View.prototype);

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
}

/**
 * Swap a view with another view.
 *
 * @param {String} from View to swap
 * @param {String} to   View to replace with.
 */

View.prototype.swap = function(from, to){
  this.children[from] = view(to);
  return this;
};