module.exports = context;
module.exports.Context = Context;
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

  if (!key)
    throw new Error("A context needs a key.");

  if (context.ctx[key])
    return context.ctx[key];

  return context.ctx[key] = new Context({
    key: key,
    parent: parent
  });

};
/**
 * Set of contexts. A context is tagged by a key and a value.
 * @type {Object}
 */

context.ctx = {};

context.clear = function() {
  context.ctx = {};
};


function Context(options) {
  this.key = options.key;
  this.parent = context.ctx[options.parent];
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

Context.prototype.get = function(key) {
  if (typeof key === "string") {
    key = key.split('.');
  }
  var prev = this.vars[key[0]];
  if (!prev) return false;
  for (var i = 1; i < key.length; i++) {
    if (!prev[key[i]]) return false;
    prev = prev[key[i]];
  }

  return prev;
};


Context.prototype.set = function(key, value) {
  if (typeof key === "string") {
    key = key.split(".");
  } else if (!isNaN(parseFloat(key)) && isFinite(key)) {
    this.vars[key] = value;
    return this;
  }

  if (key.length === 1) {
    this.vars[key[0]] = value;
    return this;
  }

  var prev = this.vars;
  for (var i = 0; i < key.length; i++) {
    if (prev) {
      prev = prev[key[i]] = (i === key.length - 1) ? value : {};
    } else {
      if (i === key.length - 1) {
        return this;
      } else {
        throw new Error("Failure setting variable within a context.");
      }
    }
  }

  return this;
};

Context.prototype.length = function() {
  return Object.keys(this.vars).length;
};

/**
 * Set each array key as a separate variable within the current context.
 * @param  {Array} arr Array
 */

Context.prototype.array = function(arr) {

  for (var i = 0; i < arr.length; i++) {
    var val = arr[i];
    this.set(i, val);
  }

  return this;
};

Context.prototype.object = function(obj) {

  for (var key in obj) {
    var val = obj[key];
    this.set(key, val);
  }

  return this;
};

Context.prototype.child = function(name) {
  this.children[name] = context(name);
  return this;
};
