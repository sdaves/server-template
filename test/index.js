var assert = require('assert')
  , fs = require('fs')
  , cheerio = require('cheerio')
  , view = require('..')
  , context = view.context;

describe('view', function(){
  afterEach(view.clear);

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

  it('should compile [text] binding.', function(){
    var $ = cheerio.load('<html><body><span data-text="name"></span></body></html>');

    // Create a new context:
    context('global')
      .set('name', 'Done');

    view.bindings.text($('html'), context('global'));

    assert($('span').html() === "Done");
  });

  it('should compile [html] binding.', function(){
    var $ = cheerio.load('<html><body><span data-html="el"></span></body></html>');

    // Create a new context:
    context('global')
      .set('el', '<div></div>');

    view.bindings.html($('html'), context('global'));

    assert($('span').html() === "<div></div>");
  });

  it('should compile [data-value] binding.', function(){
    var $ = cheerio.load('<html><body><input type="text" data-value="el" /></body></html>');

    // Create a new context:
    context('global')
      .set('el', 'Hello!');

    view.bindings.value($('html'), context('global'));
    assert($('input').attr('value') === "Hello!");
  });

  it('should compile [each] binding.', function(){
    var $ = cheerio.load('<html><body><ul><li each="user in users"><span data-text="user.name"></span></li></ul></body></html>');

    context('global')
      .set('users', [{
      name: 'John'
    }]);

    view.bindings.each($('html'), context('global'));

    var html = '<li each="user in users" style="display:none;"><span data-text="user.name"></span></li><li><span data-text="user.name">John</span></li>';

    assert($('ul').html() === html);
  });

  it('should compile [each] binding. (multiple loops)', function(){
    var $ = cheerio.load('<html><body><ul><li each="user in users"><span data-text="user.name"></span></li></ul></body></html>');

    context('global')
      .set('users', [{
      name: 'John'
    }, {
      name: 'Steve'
    }]);

    view.bindings.each($('html'), context('global'));

    var html = '<li each="user in users" style="display:none;"><span data-text="user.name"></span></li><li><span data-text="user.name">John</span></li><li><span data-text="user.name">Steve</span></li>';

    //console.log($('ul').html());

    assert($('ul').html() === html);
  });
});