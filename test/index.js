
var view = require('tower-view');
var View = view.View;
var assert = require('component-assert');
var query = require('component-query');
var events = require('component-event');

describe('view', function(){
  describe('bindings', function(){
    it('should traverse dom and add bindings', function(){
      var data = {
        users: [
          { name: 'foo' },
          { name: 'bar' }
        ]
      };

      var list = new View(query('ul'), data);
      assert('ul' === list.el.tagName.toLowerCase());
      list.bind('each');
      assert(1 === list.bindings.length);
      assert(2 === query.all('li', list.el).length);
    });

    it('should bind `data-title`', function(){
      var list = new View(query('ol'), { info: 'foo' });
      list.bind('data-title');
      assert(1 === list.bindings.length);
      assert('foo' === query('a', list.el).title);
    });
  });

  describe('events', function(){
    it('should handle `click` event', function(done){
      var el = query('ul');
      view('new-list')
        .on('click', function(event){
          assert('new-list' === event.ctx.name);
          assert('foo' === event.passThrough);
          done();
        });

      var list = view('new-list').init(el);

      var event = document.createEvent('UIEvent');
      event.initUIEvent('click', true, true);
      event.clientX = 5;
      event.clientY = 10;
      event.passThrough = 'foo';
      el.dispatchEvent(event);
    });
  });
});