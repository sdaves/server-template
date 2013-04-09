var assert = require('assert')
  , view   = require('./../');


describe('view', function() {

  afterEach(function() {
    view.clear();
  });

  it('should create a new view', function() {
    assert(view('index') instanceof view.View);
  });

  it('should save a view reference.', function() {
    view('index');

    assert(view('index') instanceof view.View);
  });

  it('should create a child view', function() {
    view('index')
      .child('home');

    view('home');

    assert(view('index').childView === view('home'));
  });

  it('should swap child views', function() {
    view('index')
      .child('home');

    view('home');
    view('about');

    assert(view('index').childView === view('home'));

    view('index').swap('about');

    assert(view('index').childView === view('about'));
  });

});