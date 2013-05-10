var view = require('tower-view');
var View = view.View;
var context = view.context;
var Context = context.Context;
var assert = require('component-assert');
var query = require('component-query');
var events = require('component-event');

describe('context', function(){

  beforeEach(function(){
    context.clear();
  });

  it('should create a new context', function(){
    var ctx = context('hello');
    assert(ctx instanceof Context);
  });

  it('should create a new child context', function(){
    var child = context('child');
    var ctx = context('hello')
      .child('chx', child);

    console.log(ctx);
    assert(ctx.children['chx'] instanceof Context);
  });

  it('should create multiple children contexts.', function(){
    var ctx = context('ctx')
      .child('one')
      .child('two')
      .child('three');

    assert(ctx.children.length === 3);
  });

  it('should find the key in the current context.', function(){

    var ctx = context('ctx');

    ctx.data = {
      user: {
        username: 'DropDrop'
      }
    };

    assert(ctx.find('user').username === 'DropDrop');
  });

  it('should find the key in the parent context.', function(){

    var parent = context('parent')
      .child('ctx');

    parent.data = {
      user: 'Hello'
    };

    assert(context('ctx').find('user') === 'Hello');
  });

});