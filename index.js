
/**
 * Module Dependencies.
 */

var fs = require('fs')
  , cheerio = require('cheerio')
  , context = require('./lib/context')
  , indexOf = require('indexof')
  , $ = null;

/**
 * Expose `view`.
 *
 * @type {Function}
 */

var exports = module.exports = view;

/**
 * Expose `View`.
 */

exports.View = View;

/**
 * Create a new view instance.
 *
 * @param  {String} name View name
 * @return {View}   View instance.
 */

function view(name) {
  // Views require a name.
  if (!name) throw new Error('You need to specify a name for the view.');

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

exports.clear = function(){
  view.views = {};
};

/**
 * List of attributes.
 *
 * @type {Array}
 */

exports.attr = {
  //'view': 'view'
  'data-text': 'dataText',
  'each': 'each',
  'on-click': 'onClick'
};

exports.methods = {};

/**
 * Hold a reference to the context.
 *
 * @type {Object}
 */

exports.context = {};

/**
 * Renders a view.
 *
 * @param  {String} name View name
 */

exports.render = function(name){
  // increment the render count.
  view.render.count++;
  // Load the template to be rendered
  var template = view.template(name);

  var compiled = view.compile(template);
  if (view.context.res) view.context.res.send(compiled);
};

/**
 * Compile the template.
 *
 * @param  {String} template view
 */

exports.compile = function(template){
  var methods = {};

  // Create a new global context if it doesn't already exist.
  context('global');

  // Load the template into cheerio.
  $ = cheerio.load(template);

  /**
   * Find and bind `data-text` attributes.
   * @param  {Elem} elem DOM element.
   * @param  {Context} ctx current context.
   * @param  {Function} filter Filter function to run against `keys`
   */

  methods.text = function(elem, ctx, filter){
    // Find all the elements with the attribute `data-text`
    elem.find('[data-text]').each(function(){
      // Get the attribute value and split by "."
      var keys = this.attr('data-text').split('.');
      // Run a filter against the `keys` variable.
      // Some use cases need to remove the first index to match the
      // context.
      if ('function' === typeof filter) keys = filter(keys);
      // If keys is still valid.
      if (keys) {
        // Replace the html with the contexts of the key within the
        // current context `ctx`
        this.html(ctx.get(keys));
      }
    });
  };

  /**
   * Render a view and render all the bindings within the view.
   * @param  {Object} elem Cheerio Object
   * @param  {Context} ctx  Current Context
   */

  methods.view = function(elem, ctx){
    // Find all the elements that are defined as views.
    elem.find('[view]').each(function(){
      // Insert a new script tag as a placeholder after the view.
      this.after('<script type="text/viewhold" data-view="' + this.attr('view') + '"></script>');
    });

    // Cache the find call.
    var uviewCache = elem.find('[view]');
    // Cache all the views for later use.
    var viewCache = {};

    // Loop through the uviewCache (#find call)
    // XXX: Rename the variables to be clearer.
    for (var kk in uviewCache) {
      // Only access valid keys.
      if (uviewCache.hasOwnProperty(kk) && kk !== 'length') {
        var val = uviewCache[kk];
        var viewName = $(val).attr('view');
        // fill the viewName (key) with the appropriate element value.
        if (viewName) viewCache[viewName] = val;
      }
    }

    // Find all the views and remove them. (We will replace them later.)
    elem.find('[view]').remove();

    // Render any [each] bindings.
    methods.each(elem, ctx);

    // Render any [data-text] bindings.
    methods.text(elem, ctx);

    // Find and replace all placeholders.
    findPlaceHolders(elem);

    /**
     * Find the elements' parent or current view.
     * @param  {Object} el Cheerio Element
     * @return {Object} Cheerio Element
     */

    function findParent(el) {
      var parent = el.parent('[view]');
      if (parent.attr('view')) return parent;
    }

    /**
     * Find and replace placeholders
     * @param  {Object}  e Cheerio Element
     * @param  {Boolean} isChild If the element is a child view.
     *
     * XXX: Rename some variables.
     */

    function findPlaceHolders(e, isChild) {
      var viewholds;

      // Only look for script tags if the element isn't a child.
      if (isChild) {
        viewholds = e;
      } else {
        viewholds = e.find('script[type="text/viewhold"]');
      }

      // If viewholds is still valid.
      if (viewholds) {
        // Loop through the viewholds.
        for (var viewKey in viewholds) {
          // Only access valid keys.
          if (viewholds.hasOwnProperty(viewKey)) {
            var cachedView = viewholds[viewKey];

            // Only if the cachedView is valid.
            if (cachedView && 'object' === typeof cachedView) {
              // DOMify the cachedView.
              cachedView = $(cachedView);

              var viewName = cachedView.attr('data-view');
              var currentView = $(viewCache[viewName]);

              // Replace the script tag with the appropriate view.
              cachedView.after(currentView.toString());
              cachedView.remove();

              // Find any sub script tags and run this function again.
              var viewElement = elem.find('[view=' + viewName + ']');
              var subScripts = viewElement.find('script[type="text/viewhold"]');
              if (subScripts) findPlaceHolders(subScripts, true);
            }
          }
        }
      }
    }

    // Render child views. (recursively)
    elem.find('[view]').each(function(){
      methods.view(this, ctx);
    });
  };

  methods.each = function(elem, ctx){
    elem.find('[each]').each(function(){
      // Create a new context.
      var attr = this.attr('each').split(' ')
        , source = attr[2]
        , malloc = attr[0];

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
        for (var i = 0, n = context(source).length(); i < n; i++) {
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

          // Replace data-text with the appropriate value from
          // the specified context.
          methods.text(clone, context(ctxName), function(keys){
            // Remove the first index.
            keys.splice(0, 1);
            return keys;
          });

          // Append to the DOM!
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
 *
 * @type {Number}
 */

exports.render.count = 0;

/**
 * Return the specified template.
 *
 * @param  {String} name Template name.
 */

exports.template = function(name, path){
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
 *
 * @type {String}
 */

exports.template.lookup = process.cwd() + '/templates/';

/**
 * Registry of all the views.
 *
 * @type {Object}
 */

exports.views = {};

/**
 * View constructor.
 *
 * @param {Object} options View options.
 */

function View(options) {
  // View/template name.
  this.name = options.name;
  // children for the current view.
  this.children = [];
  // DOM element.
  this.elem = null;
  // Current view's context.
  this.ctx = {};
}

/**
 * Add a child view.
 *
 * @param  {String} name View name
 * @return {View}   View instance
 */

View.prototype.child = function(name){
  if (!this.children[name]) {
    this.children.push(this.children[name] = view(name));
  }

  return this;
};

/**
 * Swap the current child view.
 *
 * @param  {String} name View name
 * @return {View} View instance
 */

View.prototype.swap = function(name){
  // XXX: if there are multiple child views, maybe switch by name.
  //      since it's only handling one view now this should work.
  this.children[0] = view(name);
  return this;
};