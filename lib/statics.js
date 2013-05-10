
exports.init = function(el, data){
  return new this(el, data);
}

/**
 * Template string or DOM element.
 *
 * @param {Mixed} obj
 * @api public
 */

exports.template = function(obj){
  // XXX
}

/**
 * Delegated event dispatcher (selector or element).
 *
 * @param {Mixed} obj
 * @api public
 */

exports.dispatcher = function(obj){
  this._dispatcher = obj;
  return this;
}