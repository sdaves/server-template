/**
 * Module Dependencies
 */


/**
 * Module Export
 */

exports = module.exports = context;

/**
 * Collection of Contexts
 */

exports.collection = [];

/**
 * Public API
 */

function context(name, data, parent, viewName, el) {

  if (exports.collection[name])
    return exports.collection[name];

  if ('string' === typeof parent)
    parent = context(parent);

  if (!el && viewName && 'string' !== viewName)
    el = viewName.el;

  var instance = new Context(name, data, parent, view, el);

  exports.collection.push(instance);
  exports.collection[name] = instance;
  return instance;
}

/**
 * Expose `Context`
 * @type {Function}
 */

exports.Context = Context;


/**
 * Clear the collections.
 *
 * Used for testing.
 */

exports.clear = function() {
  exports.collection = [];
}

/**
 * Constructor
 */

function Context(name, data, parent, view, el) {
  this.name = name;
  this.el = el;
  this.data = data;
  this._parent = parent || null;
  this.view = view;
  this.children = [];
}

/**
 * Add a child
 */

Context.prototype.child = function(name, ctx) {
  if (!name) return false;
  if (!ctx) ctx = context(name);
  this.children.push(ctx);
  this.children[name] = ctx;
  ctx.parent(this);
  return this;
};

/**
 * Attach a parent to the current context
 */

Context.prototype.parent = function(name, ctx) {

  if ('string' !== typeof name && !ctx) {
    ctx = name;
    name = null;
  }

  this._parent = ctx;
  return this;
};

/**
 * Find key within the contexts
 */

Context.prototype.find = function(key) {

  if (this.data && this.data[key]) {
    return this.data[key];
  } else {
    if (!_parent) {
      // Look at the parent view's context
      this.view.parent.context.find(key);
    } else {
      // Look at the parent context
      return this._parent.find(key);
    }
  }
};

