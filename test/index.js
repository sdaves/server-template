var assert = require('assert');
var view = require('..');

describe('view', function(){

  it('should', function(){
    var r = view('<html><div id="tw" data-text="hello"></div></html>', {
      hello: 123
    });
    console.log(r);
  });

});