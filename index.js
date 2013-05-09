
/**
 * Module dependencies.
 */

var Emitter = require('tower-emitter')
  , event = require('event')
  , proto = require('./lib/proto')
  , statics = require('./lib/statics');

/**
 * Expose `view`.
 */

exports = module.exports = view;

/**
 * Expose `collection`.
 */

exports.collection = [];

/**
 * Get a view constructor.
 */

function view(name) {
  if (exports.collection[name]) return exports.collection[name];

  function View(el, data) {
    this.name = name;
    this.el = el;
    this.data = data;
    this.bindings = [];

    // XXX: tmp, getting a feel for it.
    //      should be much more optimized than this.
    var click = View.listeners('click');
    if (click.length) {
      var self = this;
      event.bind(el, 'click', function(e){
        e.ctx = self; // `e.view` is taken.
        for (var i = 0, n = click.length; i < n; i++) {
          click[i](e);
        }
      });
    }
  }

  View.prototype = {};
  View.prototype.constructor = View;
  View.id = name;
  View.toString = function(){
    return 'view("' + name + '")';
  }
  View.children = [];

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
 * Expose `View`.
 */

exports.View = view('anonymous');

/**
 * Clear all the registered views, events, and contexts.
 */

exports.clear = function(){
  exports.collection = [];
  return exports;
};