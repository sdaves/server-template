
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
 * @return {Function}
 * @api public
 */

function template(node) {
  return compile(node || document.body);
}

/**
 * Traverse `node` and children recursively,
 * and collect and execute directives.
 *
 * @param {DOMNode} node
 * @param {Scope} scope
 */

function compile(node, clone) {
  var directivesFn = compileDirectives(node);
  
  // recursive
  var eachFn = node.childNodes
    ? compileEach(node.childNodes, scope)
    : undefined;

  function nodeFn(scope) {
    var returnNode = node;// clone ? node.cloneNode(true) : node;

    // apply directives to node.
    directivesFn(scope, returnNode);

    // recurse, apply directives to children.
    if (eachFn && returnNode.childNodes)
      eachFn(scope, returnNode.childNodes);

    return returnNode;
  }

  return nodeFn;
}

function compileEach(children, scope) {
  var fns = [];
  for (var i = 0, n = children.length; i < n; i++) {
    fns.push(compile(children[i]));
  }

  function eachFn(scope, children) {
    for (var i = 0, n = fns.length; i < n; i++) {
      // XXX: not sure this is correct.
      fns[i](scope, children[i]);
    }
  }

  return eachFn;
}

function compileDirectives(node) {
  var directives = getDirectives(node);

  function directivesFn(scope, node) {
    // XXX: maybe we can collect the directives in reverse
    //      and then use a `while` loop.
    for (var i = 0, n = directives.length; i < n; i++) {
      directives[i].exec(scope, node);
    }
  }

  return directivesFn;
}

function getDirectives(node) {
  var directives = [];

  switch (node.nodeType) {
    case 1: // element node
      // first, appendDirective directive named after node, if it exists.
      appendDirective(node.nodeName.toLowerCase(), directives);
      getDirectivesFromAttributes(node, directives);
      break;
    case 3: // text node
      // node.nodeValue
      appendDirective('interpolation', directives);
      break;
    case 8: // comment node
      //
      break;
  }

  directives.sort(priority);
  return directives;
}

function getDirectivesFromAttributes(node, directives) {
  var attr;
  for (var i = 0, n = node.attributes.length; i < n; i++) {
    attr = node.attributes[i];
    // The specified property returns true if the 
    // attribute value is set in the document, 
    // and false if it's a default value in a DTD/Schema.
    // http://www.w3schools.com/dom/prop_attr_specified.asp
    // XXX: don't know what this does.
    if (!attr.specified) continue;
    appendDirective(attr.name, directives);
  }
}

/**
 * Add directive.
 */

function appendDirective(name, directives) {
  if (directive.defined(name)) {
    directives.push(directive(name));
  }
}

/**
 * Sort by priority.
 */

function priority(a, b) {
  return b._priority - a._priority;
}