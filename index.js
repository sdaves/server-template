
/**
 * Module dependencies.
 */

var Emitter = require('tower-emitter')
  , proto = require('./lib/proto')
  , statics = require('./lib/statics')
  , constants = require('./lib/constants');

/**
 * Expose `view`.
 */

exports = module.exports = view;

/**
 * Expose `collection`.
 */

exports.collection = [];

/**
 * Expose `attrs`.
 */

exports.attrs = constants.attrs;

/**
 * Expose `events`.
 */

exports.events = constants.events;

/**
 * Get a `View`.
 */

function view(name) {
  if (exports.collection[name]) return exports.collection[name];

  function View(el, data, options) {
    this.name = name;
    this.el = el;
    this.data = data;
    this.bindings = [];
    if (View._dispatcher) this.dispatcher = View._dispatcher;
    if (options) {
      for (var key in options) this[key] = options[key];
    }
    this.addDOMListeners();
  }

  View.prototype = {};
  View.prototype.constructor = View;
  View.id = name;

  // statics
  for (var key in statics) View[key] = statics[key];

  // proto
  for (var key in proto) View.prototype[key] = proto[key];

  exports.collection[name] = View;
  exports.collection.push(View);
  exports.emit('define', View);
  return View;
}

/**
 * Mixin `Emitter`.
 */

Emitter(exports);
Emitter(statics);
Emitter(proto);

/**
 * Expose `View`.
 */

exports.View = view('anonymous');

/**
 * Create a new child view.
 *
 * @param {String} name View name
 */

statics.child = function(name){
  if (this.children[name]) return this;
  this.children.push(this.children[name] = exports(name));
  return this;
};

/**
 * Clear all the registered views, events, and contexts.
 */

exports.clear = function(){
  exports.collection = [];
  return exports;
};