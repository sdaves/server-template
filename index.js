/**
 * Module Dependencies.
 */

var fs = require('fs'),
  cheerio = require('cheerio'),
  $ = null,
  context = require('./lib/context');

/**
 * Export the `view` function.
 * @type {Function}
 */

module.exports = view;
module.exports.View = View;

/**
 * Creates a new view instance.
 * @param  {String} name View name
 * @return {View}   View instance.
 */

function view(name) {
  // Views require a name.
  if (!name) throw new Error("You need to specify a name for the view.");

  // Return a view instance if
  // it already exists.
  if (view.views[name]) return view.views[name];

  // Create a new view instance.
  var instance = new View({
    name: name
  });

  // Return a new view instance.
  return view.views[name] = instance;
}

/**
 * Clears the references of all the views.
 */

view.clear = function() {
  view.views = {};
};

/**
 * List of attributes
 * @type {Array}
 */

view.attr = {
  //'view': 'view'
  'data-text': 'dataText',
  'each': 'each',
  'on-click': 'onClick'
};

view.methods = {};

/**
 * Hold a reference to the context.
 * @type {Object}
 */

view.context = {};

/**
 * Renders a view.
 * @param  {String} name View name
 */

view.render = function(name) {
  // increment the render count.
  view.render.count++;
  // Load the template to be rendered
  var template = view.template(name);

  var compiled = view.compile(template);
  if (view.context.res) view.context.res.send(compiled);
};

/**
 * Compile the template.
 * @param  {String} template view
 */

view.compile = function(template) {
  var methods = {};

  // Create a new context:
  context('global')
    .set('currentUser', 'TheHydroImpulse')
    .set('users', [{
    name: 'John'
  }, {
    name: 'Julie'
  }, {
    name: 'Dod'
  }])
    .set('users2', [{
    name: 'Kate'
  }, {
    name: 'Ash'
  }, {
    name: 'Roney'
  }])

  // Load the template into cheerio.
  $ = cheerio.load(template);

  var views = [];

  /**
   * Find and bind `data-text` attributes.
   * @param  {Elem} elem DOM element.
   * @param  {Context} ctx current context.
   * @param  {Function} filter Filter function to run against `keys`
   */

  methods.text = function(elem, ctx, filter) {

    elem.find('[data-text]').each(function() {
      var keys = this.attr('data-text').split('.');

      if (typeof filter === 'function') keys = filter(keys);

      if (keys) {
        this.html(ctx.get(keys));
      }
    });

  };


  methods.view = function(elem, ctx) {

    elem.find('[view]').each(function() {
      this.after('<script type="text/viewhold" data-view="' + this.attr('view') + '"></script>');
      views.push(this.attr('view'));
    });

    // Cache the views.
    var uviewCache = elem.find('[view]');
    var viewCache = {};


    for (var kk in uviewCache) {
      if (uviewCache.hasOwnProperty(kk) && kk !== 'length') {
        var val = uviewCache[kk];
        var viewName = $(val).attr('view');
        if (viewName) viewCache[$(val).attr('view')] = val;
      }
    }

    // Remove them.
    elem.find('[view]').remove();

    // Render any [each] bindings.
    methods.each(elem, ctx);

    // Render any [data-text] bindings.
    methods.text(elem, ctx);

    findHoldplacers(elem);

    function findParent(el) {
      var parent = el.parent('[view]');
      if (parent.attr('view')) {
        return parent;
      }
    }

    function findHoldplacers(e, isChild) {
      var viewholds;

      if (isChild) {
        viewholds = e;
      } else {
        viewholds = e.find('script[type="text/viewhold"]');
      }

      if (viewholds) {

        for (var viewKey in viewholds) {

          if (viewholds.hasOwnProperty(viewKey)) {
            var cachedView = viewholds[viewKey];

            if (cachedView && typeof cachedView === "object") {
              cachedView = $(cachedView);
              var viewName = cachedView.attr('data-view');
              var currentView = $(viewCache[viewName]);

              cachedView.after(currentView.toString());
              cachedView.remove();

              var viewElement = elem.find('[view=' + viewName + ']');
              var subScripts = viewElement.find('script[type="text/viewhold"]');
              if (subScripts) findHoldplacers(subScripts, true);
            }

          }

        }

      }

    }

    // Render child views. (recursive)
    elem.find('[view]').each(function() {
      view(this.attr('view')).rendering = true;
      methods.view(this, ctx);
    });

  };

  methods.each = function(elem, ctx) {

    elem.find('[each]')
      .each(function() {

      // Create a new context.
      var attr = this.attr('each').split(' '),
        source = attr[2],
        malloc = attr[0];

      context(source, ctx.key)
        .array(context(ctx.key).get(source));

      if (context(source).length() >= 0) {
        this.attr('style', 'display:none');
        this.attr('template', true);

        // Clone it before we start appending to it. Otherwise we get a replication bug.
        var original = this.clone();
        // Remove a few attributes.
        original.removeAttr('style');
        original.removeAttr('template');
        // Loop through the context vars.
        for (var i = 0; i < context(source).length(); i++) {
          // Get the current object within the context. source = `user in users` <-- users
          var obj = context(source).vars[i];
          // Form a new context name for each iteration
          var ctxName = malloc + '.' + i;
          // Clone the original clone again, that way we get a clean copy.
          var clone = original.clone();

          // Create a new context for the loop index.
          context(ctxName, source)
          // Add an object to the context.
          // This will copy each key and value separately to the context
          // scope.
          .object(obj);

          methods.text(clone, context(ctxName), function(keys) {
            keys.splice(0, 1);
            return keys;
          });
          this.append(clone);
        }
      }

    });
  };

  methods.view($('html'), context('global'));
  return $.html();
};

/**
 * Hold the render count.
 * @type {Number}
 */

view.render.count = 0;

/**
 * Return the specified template.
 * @param  {String} name Template name.
 */

view.template = function(name, path) {
  name = name.replace(/\./, '/') + '.html';
  var lookup = path || view.template.lookup;
  // XXX: Implement view caching.
  //      This synchronous call
  //      will only happen
  //      once for every view.
  //      (unless the file changes.)
  return fs.readFileSync(lookup + name, 'utf-8');
};

/**
 * Specify the template lookup path.
 * @type {String}
 */

view.template.lookup = process.cwd() + '/templates/';

/**
 * Registry of all the views.
 * @type {Object}
 */

view.views = {};

/**
 * View constructor.
 * @param {Object} options View options.
 */

function View(options) {
  // View/template name.
  this.name = options.name;
  // childView for the current view.
  this.childView = null;
  // DOM element.
  this.elem = null;
  // Current view's context.
  this.ctx = {};
  // is rendering.
  // XXX: Move to client-side
  this.rendering = false;
  // XXX: Move to client-side
  this.rendered;
}

/**
 * Add a child view.
 * @param  {String} child View name
 * @return {View}   View instance
 */

View.prototype.child = function(child) {
  this.childView = view(child);
  return this;
};

/**
 * Swap the current child view.
 * @param  {String} name View name
 * @return {View} View instance
 */

View.prototype.swap = function(name) {
  this.childView = view(name);
  return this;
};