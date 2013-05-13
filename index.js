
/**
 * Module dependencies.
 */

var scopes = require('tower-scope')
  , directive = require('tower-directive');

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
 * @param {Boolean} clone If true, every time the template
 *    is executed, it will clone the initial node passed in.
 * @return {Function}
 * @api public
 */

function template(node, clone) {
  return compile(node || document.body, clone);
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

  // `returnNode` is used for recursively 
  // passing children. this is used for cloning, 
  // where it should apply the directives to 
  // the new children, not the original 
  // template's children.

  function nodeFn(scope, returnNode) {
    returnNode || (returnNode = node);
    if (clone) returnNode = returnNode.cloneNode(true);

    // apply directives to node.
    scope = directivesFn(scope, returnNode);

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
  var scopeFn = compileScopes(node, directives);

  function directivesFn(scope, node) {
    scope = scopeFn(scope);

    // XXX: maybe we can collect the directives in reverse
    //      and then use a `while` loop.
    for (var i = 0, n = directives.length; i < n; i++) {
      directives[i].exec(scope, node);
    }

    return scope;
  }

  return directivesFn;
}

function compileScopes(node, directives) {
  var name; // XXX: maybe it needs to handle multiple scopes on a node?

  for (var i = 0, n = directives.length; i < n; i++) {
    if (name = directives[i]._scope) break;
  }

  if (name) {
    if (true === name) {
      // XXX: not sure best way to handle this yet.
      name = node.getAttribute('data-scope');
    }
  }

  function scopeFn(scope) {
    if (!name) return scope;

    return scopes(name).init({ parent: scope });
  }

  return scopeFn;
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