
/**
 * Module dependencies.
 */

var Emitter = require('tower-emitter')
  , scope = require('tower-scope')
  , proto = require('./lib/proto')
  , statics = require('./lib/statics');

/**
 * Expose `controller`.
 */

exports = module.exports = controller;

/**
 * Expose `collection`.
 */

exports.collection = [];

/**
 * Get a `Controller`.
 */

function controller(name) {
  if (exports.collection[name]) return exports.collection[name];

  function Controller(_scope) {
    this.name = name;
    this.scope = _scope;
  }

  Controller.prototype = {};
  Controller.prototype.constructor = Controller;
  Controller.id = name;

  // statics
  for (var key in statics) Controller[key] = statics[key];

  // proto
  for (var key in proto) Controller.prototype[key] = proto[key];

  exports.collection[name] = Controller;
  exports.collection.push(Controller);
  exports.emit('define', Controller);
  return Controller;
}

/**
 * Mixin `Emitter`.
 */

Emitter(exports);
Emitter(statics);
Emitter(proto);

/**
 * Clear all the registered controllers, events, and contexts.
 */

exports.clear = function(){
  exports.collection = [];
  return exports;
};