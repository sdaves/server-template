/**
 * Module dependencies
 */

var fs = require('fs');
var path = require('path');

/**
 * Module Exports
 */

exports = module.exports = function() {
  return view;
};

/**
 * readFile wrapper
 */

function read(file) {
  return function(fn) {
    fs.readFile(file, 'utf-8', fn);
  };
}

/**
 * Configuration
 */

exports._config = {};

/**
 * Set config
 */

exports.config = function(key, val) {
  exports._config[key] = val;
};

/**
 * View function
 */

function view(next) {
  return function *() {
    var self = this;
    this.render = function(file, options) {
      return function* go() {
        var originFile = file;
        for (var i = 0, n = exports._config['paths'].length; i < n; i++) {
          var p = exports._config['paths'][i];

          file = file.replace(/[.]/g, '/');

          var fullPath = path.join(p, file + '.' + exports._config['extension']);

          var found = true;
          try {
            var result = yield read(fullPath);
          } catch(e) {
            found = false;
            continue;
          } finally {
            if (!found) {
              self.code = 500;
              self.type = 'text/html';
              self.body = "<h1>500</h1><h3>We cannot find view: "+originFile+". Tried "+fullPath+"</h3>";
              return;
            } else {
              self.code = 200;
              self.type = 'text/html';
              self.body = result;
            }
          }
        }
      }

    };

    yield next;
  };
}