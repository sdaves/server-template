var view = 'undefined' == typeof window ? require('..') : require('tower-view')
  , assert = require('component-assert');

describe('client view', function(){

  it('should create a new view instance.', function(){
    var instance = view('body');
    assert(view('body') === instance);
  });

  it('should create a new context instance.', function() {
    var instance = view.context('global');
    assert(view.context('global') === instance);
  });

});
