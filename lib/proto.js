
/**
 * Module dependencies.
 */

var query = require('query')
  , binding = require('./bindings');

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
  }
}

/**
 * Clone.
 */

exports.clone = function(){
  var clone = this.el.cloneNode(true);
  return this.constructor.init(clone, this.data);
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