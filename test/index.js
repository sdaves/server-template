var assert = require('assert');
var view = require('..');

describe('view', function(){

  it('should should compile simple text directive', function(){
    var r = view('<html><div id="tw" data-text="hello"></div></html>', {
      hello: 123
    });
    assert(r === '<html><head></head><body><div id="tw" data-text="hello">123</div></body></html>');
  });



});