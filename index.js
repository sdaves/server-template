/**
 * Module dependencies
 */

var dom = require('tower-server-dom');
var content = require('tower-content');
var directive = require('tower-directive');

directive('data-text', function(scope, el, attr) {
  el.textContent = scope.data[attr.val];
});

/**
 * Module Exports
 */

exports = module.exports = view;

function view(html, scope) {
  var document = dom(html).document;
  var c = content('annon').init(scope);
  return exports.compile(document, c);
}

exports.compile = function(document, scope) {
  var queue = [];
  queue.push(document.childNodes[0]);

  while (queue.length > 0) {
    var node = queue.pop();
    // Directives.
    var _directives = [];

    if (node.nodeType === 1) {
      // Only try and compile directives that we have
      for (var i = 0; i < node.attributes.length; i++) {
        var a = node.attributes[i];
        if (directive.collection[a.name]) {
          _directives.push(a.name);
        }
      }
    }

    for (var j = 0; j < _directives.length; j++) {
      var d = _directives[j];
      var e = directive(d).compile(node, function() {
        console.log(1);
      })(scope, node);
    }

    if (node.childNodes) {
      for (var k = 0; k < node.childNodes.length; k++) {
        queue.push(node.childNodes[k]);
      }
    }

  }

  return document.childNodes[0].outerHTML;
};