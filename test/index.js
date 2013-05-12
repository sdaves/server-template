
var template = require('tower-template')
  , directive = require('tower-directive')
  , scope = require('tower-scope')
  , assert = require('component-assert')
  , query = require('component-query');

describe('template', function(){
  beforeEach(directive.clear);
  
  it('should execute all', function(){
    directive('data-text', function(scope, element, attr){
      element.textContent = scope[attr.value];
    });

    directive('data-title', function(scope, element, attr){
      element.setAttribute('title', scope[attr.value]);
    });

    template(document.body, scope('random').init({ foo: 'Foo', bar: 'Bar' }));

    assert('Foo' === query('#should-execute-all').title);
    assert('Bar' === query('#should-execute-all span').textContent);
  });

  it('should use `scope("root")` if none is passed in', function(){
    directive('data-html', function(scope, element, attr){
      element.innerHTML = scope[attr.value];
    });

    scope.root().set('foo', 'Hello World');

    template(document.body);

    assert('Hello World' === query('#should-use-root-scope').innerHTML);
  });

  describe('directives', function(){
    it('should have `data-text`', function(){
      assert(true === directive.defined('data-text'));
      var root = scope.root();
      root.set('textDirective', 'Text Directive');
      template(query('#directives'), root);
      assert('Text Directive' === query('#data-text-directive span').textContent);
    });

    // XXX: should iterate through all to test them all.
    it('should have `data-[attr]`', function(){
      assert(true === directive.defined('data-title'));
      var root = scope.root();
      root.set('attrDirective', 'Attribute Directive');
      template(query('#directives'), root);
      assert('Attribute Directive' === query('#data-attr-directive a').title);
    });

    it('should have event directives `on-[event]`', function(done){
      assert(true === directive.defined('on-click'));
      var root = scope.root();
      root.set('eventDirective', function(){
        done();
      });
      template(query('#directives'), root);

      var event = document.createEvent('UIEvent');
      event.initUIEvent('click', true, true);
      event.clientX = 5;
      event.clientY = 10;
      event.passThrough = 'foo';
      query('#data-event-directive a').dispatchEvent(event);
    });
  });

  describe('compile', function(){
    it('should compile directives', function(){
      var root = scope.root();
      root.textDirective = 'Text Directive!';
      root.attrDirective = 'Attr Directive!';
      template(query('#compile'), root);
    });
  });

  after(function(){
    document.body.removeChild(query('#tests'));
  });
});