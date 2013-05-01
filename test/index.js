var view = 'undefined' == typeof window ? require('..') : require('tower-view')
  , assert = require('component-assert');

describe('client view', function(){
  afterEach(function(){
    view.clear();
  });

  it('should create a new view instance.', function(){
    var instance = view('body');
    assert(view('body') === instance);
  });

  it('should create a new context instance.', function(){
    var instance = view.context('global');
    assert(view.context('global') === instance);
  });

  it('should emit `define` event on view creation.', function(done){
    var newView;

    view.on('define', function(instance){
      done();
    });

    newView = view('newView');
  });

  it('should emit `define newView` event on view creation.', function(done){
    var newView;

    view.on('define newView', function(instance){
      done();
    });

    newView = view('newView');
  });

  it('should emit `init` event.', function(done){
    view.on('init', function(){
      done();
    });

    view.init();
  });

  it('should define 1 children view', function(){
    var instance = view('body')
      .child('app');

    assert(instance.children[0] === view('app'));
  });

  it('should define more than one child view.', function(){
    var instance = view('body')
      .child('app')
      .child('melon');

    assert(instance.children[0] === view('app'));
    assert(instance.children[1] === view('melon'));
  });

  it('should return true if view has children.', function(){
    var instance = view('body')
      .child('app');

    assert(instance.hasChildren() === true);
  });

  it('should return false if view has no children.', function(){
    var instance = view('body');

    assert(instance.hasChildren() === false);
  });

  it('should set body element if view name is body', function(){
    view('body');

    assert(!! view('body').elem);
  });

  it('should not be rendered.', function(){
    // XXX:
    //assert(view('oneT').rendered === false);
  });

  it('should add `render` queue within the runloop', function(){
    var containsRenderQueueName =
      view.run.queues.indexOf('render') !== -1;

    assert(true === containsRenderQueueName);
  });

  it('should trigger `render` queue (runloop)', function(done){
    view.on('before render', function(){
      done();
    });

    view.run(function(){
      view.run.batch('sync', {}, 1233, function(){ });
    });
  });
});