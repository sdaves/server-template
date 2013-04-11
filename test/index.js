var assert = require('assert')
  , view = require('./../')
  , fs = require('fs')
  , context = require('./../lib/context')
  , cheerio = require('cheerio');

describe('view', function(){
  afterEach(function(){
    view.clear();
    context.clear();
  });

  it('should create a new view', function(){
    assert(view('index') instanceof view.View);
  });

  it('should save a view reference.', function(){
    view('index');

    assert(view('index') instanceof view.View);
  });

  it('should create a child view', function(){
    view('index')
      .child('home');

    view('home');

    assert(view('index').children[0] === view('home'));
  });

  it('should swap child views', function(){
    view('index')
      .child('home');

    view('home');
    view('about');

    assert(view('index').children[0] === view('home'));

    view('index').swap('about');

    assert(view('index').children[0] === view('about'));
  });

  it('should create multiple child views', function(){
    view('body')
      .child('navigation')
      .child('content')
      .child('sidebar')
      .child('footer');

    assert(4 === view('body').children.length);
    assert('navigation' === view('body').children[0].name);
    assert('content' === view('body').children[1].name);
    assert('sidebar' === view('body').children[2].name);
    assert('footer' === view('body').children[3].name);
  });

  it('should keep child view order', function(){
    view('body')
      .child('navigation')
      .child('content')
      .child('sidebar')
      .child('footer')
      .child('content')
      .child('footer')
      .child('navigation')
      .child('sidebar');

    assert(4 === view('body').children.length);
    assert('navigation' === view('body').children[0].name);
    assert('content' === view('body').children[1].name);
    assert('sidebar' === view('body').children[2].name);
    assert('footer' === view('body').children[3].name);
  });

  it('should load the render method.', function(){
    var num = view.render.count;
    view.template.lookup = process.cwd() + '/test/templates/';
    view.render('index');
    assert(num === 0);
    assert(view.render.count === 1);
  });

  it('should load the template file.', function(){
    var template = fs.readFileSync(process.cwd() + '/test/templates/' + 'index.html', 'utf-8');

    assert(view.template('index', process.cwd() + '/test/templates/') === template);
  });

  it('should have hierarchical child views.', function(){
    view('body')
      .child('home');

    view('home')
      .child('action');

    view('action');

    assert(view('body').children[0].children[0] === view('action'));
  });

  it('should create a new context', function(){
    context('global');
    assert(context.ctx['global'] === context('global'));
  });

  it('should create a child view', function(){
    context('global')
      .child('loopOne')
      .child('loopTwo');

    assert(context('global').children['loopOne'] === context('loopOne'));
    assert(context('global').children['loopTwo'] === context('loopTwo'))
  });

  it('should set & access vars from current context', function(){
    context('global')
      .set('var', 1);

    assert(context('global').get('var') === 1);
  });

  it('should set & access vars from current context (namespacing).', function(){
    context('global')
      .set('var.one', 1)
      .set('va2r.two', 2);
    assert(context('global').get('var.one') === 1);
    assert(context('global').get('va2r.two') === 2);
  });

  it('should compile [text] binding.', function() {

    var $ = cheerio.load('<html><body><span data-text="name"></span></body></html>');

    // Create a new context:
    context('global')
      .set('name', 'Done');

    view.bindings.text($('html'), context('global'));

    assert($('span').html() === "Done");

  });

});