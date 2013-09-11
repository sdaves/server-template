var view = require('..');

var time = new Date().getTime();

var avg = 0;

var i;
for (i = 1; i < 100000; i++) {
var t11 = new Date().getTime();
view('<html><div data-text="hello"></div></html>', {
  hello: "Hello World 123"
});
avg += (new Date().getTime() - t11);
}
var t2 = new Date().getTime();

console.log("1000 views compiled in " + (t2 - time) / 1000 + "s");
console.log("Avg rendering time: " + avg / i * 100 + "ms");