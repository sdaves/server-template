var view = 'undefined' == typeof window ? require('..') : require('tower-view')
  , assert = require('component-assert');

describe('client view', function(){
  afterEach(function() {
    view.clear();
  });

  it('should create a new view instance.', function(){
    var instance = view('body');
    assert(view('body') === instance);
  });

  it('should create a new context instance.', function() {
    var instance = view.context('global');
    assert(view.context('global') === instance);
  });

  it('should emit `defined` event on view creation.', function() {
    var newView;

    // XXX: Make the test fail if the callback doesn't fire.
    view.on('defined', function(instance) {
      assert(instance);
    });

    newView = view('newView');

  });

  it('should emit `init` event.', function() {

    view.on('init', function() {
      assert(true);
    });

    view.init();
  });

  it('should define 1 children view', function() {

    var instance = view('body')
      .child('app');

    assert(instance.children[0] === view('app'));
  });

  it('should define more than one child view.', function() {
    var instance = view('body')
      .child('app')
      .child('melon');

    assert(instance.children[0] === view('app'));
    assert(instance.children[1] === view('melon'));
  });

  it('should return true if view has children.', function() {
    var instance = view('body')
      .child('app');

    assert(instance.hasChildren() === true);
  });

  it('should return false if view has no children.', function() {
    var instance = view('body');

    assert(instance.hasChildren() === false);
  });

  it('should set body element if view name is body', function() {
    view('body');

    assert(!! view('body').elem);
  });

  it('should has `not rendered` state before rendering.', function() {
    assert(view('one').state === 'not rendered');
  });

});
