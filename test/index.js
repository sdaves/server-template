var assert = require('assert');
var view = require('..');
var content = require('tower-content');

describe('view', function(){

  beforeEach(function(){
    content.clear();
  });

  it('should compile simple text directive', function(){
    var r = view('<html><div id="tw" data-text="hello"></div></html>', {
      hello: 123
    });
    assert(r === '<html><head></head><body><div id="tw" data-text="hello">123</div></body></html>');
  });

  it('should compile title directive', function(){
    var r = view('<html><div data-title="world"></div></html>', {
      world: "Wonderful"
    });

    assert(r === '<html><head></head><body><div data-title="world" title="Wonderful"></div></body></html>');
  });

  it('should compile nested node', function(){
    var r = view('<html><div><span data-text="h"></span></div></html>', {
      h: 123
    });

    assert(r === '<html><head></head><body><div><span data-text="h">123</span></div></body></html>');
  });

});