/**
 * Module dependencies
 */

var dom = require('tower-server-dom');
var content = require('tower-content');
var directive = require('tower-directive');
var Attribute = dom.Attribute;

directive('data-text', function(scope, el, attr) {
  //console.log(scope);
  el.textContent = scope.attrs[attr.val];
});

directive('data-title', function(scope, el, attr){
  var att = new Attribute();
  att.name = 'title';
  att.value = scope.data[attr.val];
  el.attributes.push(att);
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

    if (node.nodeType === 1) {
      // Only try and compile directives that we have
      for (var i = 0; i < node.attributes.length; i++) {
        var a = node.attributes[i];
        if (directive.collection[a.name]) {
          var e = directive(a.name).compile(node, function() {
          })(scope, node);
        }
      }
    }

    if (node.childNodes) {
      for (var k = 0; k < node.childNodes.length; k++) {
        queue.push(node.childNodes[k]);
      }
    }

  }

  return document.childNodes[0].outerHTML;
};
