
/**
 * Expose `context`.
 */

var exports = module.exports = context;

/**
 * Expose `Context`.
 */

exports.Context = Context;

/**
 * Create or access a context.
 * A global context is first created with a key of 'global'. Secondary contexts
 * can be created for `each` loops or if it's explicitly defined.
 *
 * Each context that's within another context needs to define it's parent.
 *
 * @param  {String|Array} key
 */

function context(key, parent) {
  if (!key) throw new Error('A context needs a key.');

  if (exports.ctx[key]) return exports.ctx[key];

  return exports.ctx[key] = new Context({
      key: key
    , parent: parent
  });
};

/**
 * Set of contexts. A context is tagged by a key and a value.
 *
 * @type {Object}
 */

exports.ctx = {};

/**
 * Clear the contexts (Mostly used for testing.)
 */

exports.clear = function(){
  exports.ctx = {};
};

/**
 * Context constructor.
 *
 * @param {Object} options
 */

function Context(options) {
  this.key = options.key;
  this.parent = exports.ctx[options.parent];
  this.children = {};
  this.vars = {}; // A variable scope
}

/**
 * Get a variable. If a variable is not defined within the current
 * context we'll search the parent's context and keep going up the
 * chain until we have no more parents or we find the variable.
 *
 * @param {String|Array} Variable name.
 *
 */

Context.prototype.get = function(key){
  if ('string' === typeof key) key = key.split('.');

  var prev = this.vars[key[0]];
  // If we can't find the key, return undefined.
  if (!prev) return undefined;

  for (var i = 1, n = key.length; i < n; i++) {
    // Can't find the key, return undefined.
    if (!prev[key[i]]) return undefined;
    prev = prev[key[i]];
  }

  return prev;
};

/**
 * Assign values to keys to `vars`.
 * Keys can be strings, arrays, objects or numbers.
 *
 * @param {Any} key
 * @param {Any} value
 */

Context.prototype.set = function(key, value){
  if ('string' === typeof key) key = key.split(".");

  // Check if the key is a number.
  else if (!isNaN(parseFloat(key)) && isFinite(key)) {
    this.vars[key] = value;
    return this;
  }

  // If a key only has a single index, assign it directly.
  if (1 === key.length) {
    this.vars[key[0]] = value;
    // Make this method chain-able.
    return this;
  }

  // Previous object.
  // This will be added onto which will basically turn into:
  // `this.vars[key[0]][key[1]][key[2]] = value;
  var prev = this.vars;
  // Initiate a new loop around the key array.
  for (var i = 0, n = key.length; i < n; i++) {
    // if `prev` isn't null or undefined. If it's null|undefined
    // we either return because we're done, or we throw an error
    if (prev) {
      // Stack a new part to the `prev` object. If we're at the last
      // iteration within the loop, we can assign the real value.
      // Otherwise we can set a new object to it.
      prev = prev[key[i]] = (i === key.length - 1)
        ? value
        : {};
    } else {
      // If we're at the end of the loop.
      if (i === key.length - 1) {
        // we're done.
        return this;
      } else {
        // XXX: Not sure if we should throw an error.
        throw new Error('Failure setting variable within a context.');
      }
    }
  }

  // Make this method chain-able.
  return this;
};

/**
 * Return the length of the `vars` object.
 *
 * @return {Number} length
 */

Context.prototype.length = function(){
  return Object.keys(this.vars).length;
};

/**
 * Set each array key as a separate variable within the current context.
 *
 * @param  {Array} arr
 */

Context.prototype.array = function(arr){
  if (!arr || 0 === array.length) return this;

  for (var i = 0; i < arr.length; i++) {
    var val = arr[i];
    this.set(i, val);
  }

  return this;
};

/**
 * Turn an object into separate keys
 *
 * @param  {Object} obj
 */

Context.prototype.object = function(obj){
  for (var key in obj) {
    var val = obj[key];
    this.set(key, val);
  }

  return this;
};

/**
 * Create a child context.
 *
 * @param  {String} name Child name
 */

Context.prototype.child = function(name){
  this.children[name] = context(name);
  return this;
};
