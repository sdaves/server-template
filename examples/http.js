var http = require('http');
var view = require('..');
var agent = require('webkit-devtools-agent');


http.createServer(function(req, res) {
  var r = view('<html><div data-text="hello"></div></html>', {
    hello: "Hello World 123"
  });
  res.setHeader('Content-Type', 'text/html');
  res.write(r);
  res.end();
}).listen(3000);

console.log(process.pid);