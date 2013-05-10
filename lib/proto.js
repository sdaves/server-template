
/**
 * Module dependencies.
 */

var query = require('query')
  , event = require('event')
  , binding = require('./bindings')
  , events = require('./constants').events
  , each = require('part-each-array');

/**
 * Bind.
 */

exports.bind = function(name){
  if (!name) {
    // for each
  } else {
    var els = query.all('[' + name + ']', this.el);
    for (var i = 0, n = els.length; i < n; i++) {
      this.bindings.push(binding(name).init(els[i], this).bind());
    }
  }

  return this;
}

/**
 * Unbind.
 */

exports.unbind = function(name){
  if (name) {

  } else {
    for (var i = 0, n = this.bindings.length; i < n; i++) {
      this.bindings[i].unbind();
    }
    this.bindings.length = 0;
  }
  return this;
}

/**
 * Clone.
 */

exports.clone = function(){
  var clone = this.el.cloneNode(true);
  return this.constructor.init(clone, this.data);
}

/**
 * Remove.
 */

exports.remove = function(){
  this.unbind().removeDOMListeners();
  return this;
}

/**
 * Detach.
 */

exports.detach = function(){
  this.unbind().removeDOMListeners();
  // XXX: jQuery
  this.el.detach();
  return this;
}

/**
 * Attach event listeners.
 *
 * @api private
 */

exports.addDOMListeners = function(){
  var self = this;
  // XXX
  var dispatcher = this.dispatcher;
  // XXX: tmp, getting a feel for it.
  //      should be much more optimized than this.
  each(events, function(name){
    var fns = self.constructor.listeners(name);
    if (!fns.length) return;

    event.bind(self.el, name, function(e){
      e.ctx = self; // `e.view` is taken.
      for (var i = 0, n = fns.length; i < n; i++) {
        fns[i](e);
      }
    });
  });
  return this;
}

/**
 * Attach event listeners.
 *
 * @api private
 */

exports.removeDOMListeners = function(){
  var self = this;
  for (var i = 0, n = events.length; i < n; i++) {
    this.removeAllListeners(events[i]);
    // event.bind(this.el, events[i], function(e){
  }
  return this;
}

/**
 * Render the current view and apply all it's bindings.
 *
 * @return {View}
 */

exports.render = function(){
  // Cannot render this view as it doesn't need to be
  // rendered. This typicall means it's not activated yet (
  // i.e within a script tag.)
  if (!this.renderable) return false;

  // Let everyone know were rendering.
  this.rendering = true;
  // Emit that were rendering.
  this.emit('before render', this);

  // XXX Render Logic
  this.constructor.emit('render', this);
  this.emit('render', this);
  // XXX End of Render Logic

  // Were done rendering.
  this.rendering = false;
  // Let everyone know that.
  this.emit('after render', this);

  return this;
};