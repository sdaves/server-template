/**
 * Module dependencies
 */

var fs = require('fs');
var path = require('path');
var stackTrace = require('stack-trace');
// XXX: This is all going ot be moved away from this module.
var jsdom = require('jsdom');
var template = require('tower-template');
var content = require('tower-content');
var document = jsdom.jsdom('');
var window = document.createWindow();

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

exports._config = {
  engine: engine
};

/**
 * View caching
 */

exports._cache = {};

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

    // Setup the new content
    this.content = content().init({});
    //console.log(this.content);
    this.scope = Proxy.create({
      set: function(handler, key, val) {
        self.content.attrs[key] = val;
      },
      get: function(handler, key) {
        return self.content.attrs[key];
      },
      enumerate: function() {

      },
      getOwnPropertyNames: function() {
        return Object.keys(self.content.attrs)
      },
      getOwnPropertyDescriptor: function(name) {
        var desc = Object.getOwnPropertyDescriptor(self.content.attrs, name);
        if (desc !== undefined) {
          desc.configurable = true;
        }
        return desc;
      },
      keys: function() {
        return Object.keys(self.content.attrs);
      }
    });

    this.render = function(name, options) {
      return function * () {
        if (!options) options = {};
        /**var originFile = file;**/

        if (!exports._config['engine']) throw new Error("View engine has not been defined.");

        // Check to see if we already have that view in cache.
        if (exports._views[name]) {
          var i = exports._views[name];
          // Get the absolute path including extension.
          yield exports._config['engine'](i.path, options);
        } else {
          // Create it.
          var viewObj = new View({
            name: name
          });
          // Check if there's a local view folder.
          var trace = stackTrace.parse(self._route.stack);
          var callingFile = trace[1].getFileName();
          callingFile = callingFile.split('/').slice(0, -1).join('/');
          var fPath = false;

          for (var i = 0, n = exports._config['paths'].length; i < n; i++) {
            var p = exports._config['paths'][i];

            var m = (new RegExp(RegExp.quote(callingFile))).exec(p);
            if (m) {
              fPath = p;
              break;
            }
          }

          if (fPath) {
            var strippedName = name.replace(/[.]/g, '/') + '.' +
              exports._config['extension'];
            viewObj.path = path.join(fPath, strippedName);
            var result = yield viewObj.engine(viewObj.path, options, self.content);

            if (result.error) {
              this.status = 500;
              this.body = result.error;
            } else {
              this.type = result.type;
              this.status = 200;
              this.body = result.body;
            }
          }

        }

        /**

         **/

        /**if (exports._cache[file]) {
          yield render('', exports._cache[file]);
        }

        for (var i = 0, n = exports._config['paths'].length; i < n; i++) {
          yield render(exports._config['paths'][i]);
        }

        function * render(_path, data) {
          file = file.replace(/[.]/g, '/');

          var fullPath = path.join(_path, file + '.' + exports._config['extension']);

          var found = true;
          var result = '';
          if (!data) {
            try {
              result = yield read(fullPath);
              exports._cache[originFile] = result;
            } catch (e) {
              found = false;
            }
          } else {
            result = data;
          }

          if (!found) {
            self.code = 500;
            self.type = 'text/html';
            self.body = "<h1>500</h1><h3>We cannot find view: " + originFile + ". Tried " + fullPath + "</h3>";
          } else {
            self.type = 'text/html';
            var date = new Date();
            // Set the document
            document.innerHTML = result;
            var fn = template(document);
            fn(self.content);
            self.body = document.outerHTML;
            console.log("Rendering took -> " + ((+new Date()) - date.getTime()) + "ms");
            return;
          }
        }**/
      }; // Generator
    }; // .render

    yield next;
  };
}

/**
 * View lookup
 *
 * This
 *
 * 1) Check to see whether that view has already been
 *    created. Views are stored by name.
 */

exports.lookup = function(name, options) {
  if (exports._views[name]) {
    var instance = exports._views[name];

    return;
  }
};

/**
 * Expose `View` constructor
 */

exports.View = View;

/**
 * Collection of views
 */

exports._views = [];

/**
 * View constructor
 */

function View(options) {
  options = options || {};
  this.name = options.name;
  // Lookup path
  this.path = options.path;
  // "layout" || "partial"
  //this.type = 'layout';
  // Engine.
  this.engine = exports._config['engine'];
}

/**
 * Engine
 */

function* engine(path, options, content) {
  // Render it out.
  var file = null;
  try {
    file = yield read(path);
  } catch (e) {}

  if (file) {
    document.innerHTML = file;
    var fn = template(document);
    fn(content);
    return {
      error: false,
      body: document.outerHTML,
      type: 'text/html'
    };
  }

  return {
    error: "Cannot find view " + path
  };
}