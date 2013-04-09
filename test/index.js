var assert = require('assert')
  , view   = require('./../')
  , fs     = require('fs');


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

  it('should load the render method.', function() {

    var num = view.render.count;
    view.render('index');
    assert(num === 0);
    assert(view.render.count === 1);

  });

  it('should load the template file.', function() {

    var template = fs.readFileSync(process.cwd() + '/test/templates/' + 'index.html', 'utf-8');

    assert(view.template('index', process.cwd() + '/test/templates/') === template);
  });

  it('should have hierarchical child views.', function() {

    view('body')
      .child('home');

    view('home')
      .child('action');

    view('action');

    assert(view('body').childView.childView === view('action'));

  });

});