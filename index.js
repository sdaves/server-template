/**
 * Module dependencies
 */

var fs = require('fs');
var path = require('path');
var stackTrace = require('stack-trace');

/**
 * Helper
 */

RegExp.quote = function(str) {
  return (str + '').replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
};

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
  return function * () {
    var self = this;
    this.render = function(file, options) {
      return function * go() {
        var originFile = file;
        var trace = stackTrace.parse(self._route.stack);
        var callingFile = trace[1].getFileName();
        callingFile = callingFile.split('/').slice(0, -1).join('/')

        for (var i = 0, n = exports._config['paths'].length; i < n; i++) {
          var p = exports._config['paths'][i];

          var m = (new RegExp(RegExp.quote(callingFile))).exec(p);
          if (m) yield render(p);
        }

        for (var i = 0, n = exports._config['paths'].length; i < n; i++) {
          var _path = exports._config['paths'][i];
          yield render(_path);
        }

        function* render(_path) {
          file = file.replace(/[.]/g, '/');

          var fullPath = path.join(_path, file + '.' + exports._config['extension']);

          var found = true;
          try {
            var result = yield read(fullPath);
          } catch (e) {
            found = false;
            return;
          } finally {
            if (!found) {
              self.code = 500;
              self.type = 'text/html';
              self.body = "<h1>500</h1><h3>We cannot find view: " + originFile + ". Tried " + fullPath + "</h3>";
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