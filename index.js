
/**
 * Module dependencies.
 */

var scopes = require('tower-scope')
  , directive = require('tower-directive')
  , isArray = require('part-is-array');

/**
 * Expose `template`.
 */

exports = module.exports = template;

/**
 * Expose `compile`.
 */

exports.compile = compile;

/**
 * Compile a DOM element's directives to a function.
 *
 * @param {HTMLNode} node
 * @param {Scope} scope
 * @return {Function}
 * @api public
 */

function template(node, scope) {
  // XXX: impl `part/is-dom-node` http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
  //      for dynamic arguments
  node || (node = document.body);
  scope || (scope = scopes.root());
  return compile(node, scope);
}

/**
 * Traverse `node` and children recursively,
 * and collect and execute directives.
 *
 * @param {DOMNode} node
 * @param {Scope} scope
 */

function compile(node, scope) {
  if (isArray(node)) return compileEach(node, scope);

  var directives = compileNode(node);
  if (directives.length) exec(node, directives, scope);
    // recursive
  if (node.childNodes) compileEach(node.childNodes, scope);
  return node;
}

function compileEach(children, scope) {
  for (var i = 0, n = children.length; i < n; i++) {
    compile(children[i], scope);
  }
  return children;
}

function compileNode(node) {
  var directives = [];

  switch (node.nodeType) {
    case 1: // element node
      // first, add directive named after node, if it exists.
      add(node.nodeName.toLowerCase(), directives);
      compileAttributes(node, directives);
      break;
    case 3: // text node
      // node.nodeValue
      add('interpolation', directives);
      break;
    case 8: // comment node
      //
      break;
  }

  directives.sort(priority);
  return directives;
}

function compileAttributes(node, directives) {
  var attr;
  for (var i = 0, n = node.attributes.length; i < n; i++) {
    attr = node.attributes[i];
    // The specified property returns true if the 
    // attribute value is set in the document, 
    // and false if it's a default value in a DTD/Schema.
    // http://www.w3schools.com/dom/prop_attr_specified.asp
    // XXX: don't know what this does.
    if (!attr.specified) continue;
    add(attr.name, directives);
  }
}

/**
 * Add directive.
 */

function add(name, directives) {
  if (directive.defined(name)) {
    directives.push(directive(name));
  }
}

/**
 * Execute all directives.
 */

function exec(node, directives, scope) {
  for (var i = 0, n = directives.length; i < n; i++) {
    directives[i].exec(scope, node);
  }
}

/**
 * Sort by priority.
 */

function priority(a, b) {
  return b._priority - a._priority;
}