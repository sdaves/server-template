var assert = require('assert')
  , view   = require('./../')
  , fs     = require('fs')
  , context = require('./../lib/context');

describe('view', function() {

  afterEach(function() {
    view.clear();
    context.clear();
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
    view.template.lookup = process.cwd() + '/test/templates/';
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

  it('creates a new context', function() {
    context('global');
    assert(context.ctx['global'] === context('global'));
  });

  it('creates a child view', function() {
    context('global')
      .child('loopOne')
      .child('loopTwo');

    assert(context('global').children['loopOne'] === context('loopOne'));
    assert(context('global').children['loopTwo'] === context('loopTwo'))
  });

  it('should set & access vars from current context', function() {
    context('global')
      .set('var', 1);

    assert(context('global').get('var') === 1);
  });

  it('should set & access vars from current context (namespacing).', function() {
    context('global')
      .set('var.one', 1)
      .set('va2r.two', 2);
    assert(context('global').get('var.one') === 1);
    assert(context('global').get('va2r.two') === 2);
  });

});