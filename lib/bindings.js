
/**
 * Module dependencies.
 */

var binding = require('tower-binding')
  , run = require('./run-loop')
  , event = require('event')
  , each = require('part-each-array')
  , constants = require('./constants');

/**
 * Expose `binding`.
 */

module.exports = binding;

/**
 * Generate attribute bindings.
 */

each(constants.attrs, function(attr){
  var name = 'data-' + attr;
  binding(name, function(ctx, el, view){
    // ctx.change(function(){
      el.setAttribute(attr, view.data[el.getAttribute(name)]);
    //});
  });
});

/**
 * Bind `data-text`.
 */

binding('data-text', function(ctx, el, view){
  var val = el.getAttribute('data-text');
  el.textContent = view.data[val];
});

/**
 * Bind `each`.
 */

binding('each', function(ctx, el, view){
  var val = el.getAttribute('each').split(/ +/);
  el.removeAttribute('each');

  if (val.length > 1) {
    var name = val[0];
    var prop = val[2];
  } else {
    var prop = val[0];
  }

  var arr = view.data[prop]; // ctx.value(prop);

  arr.forEach(function(obj){
    var clone = el.cloneNode(true);
    // XXX: view.clone().bind().el);
    el.parentNode.appendChild(clone);
  });

  el.parentNode.removeChild(el);
});

/**
 * Generate event bindings.
 */

each(constants.events, function(name){
  var attr = 'on-' + name;
  binding(attr, function(ctx, el, view){
    var method = el.getAttribute(attr);
    // XXX
  });
});