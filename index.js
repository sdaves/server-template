/**
 * Module Dependencies.
 */

var fs = require('fs')
  , cheerio = require('cheerio')
  , $ = null
  , context = require('./lib/context');

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
  if (view.views[name])
    return view.views[name];

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
    'data-text': 'dataText'
  , 'each': 'each'
  , 'on-click': 'onClick'
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
  if (view.context.res)
    view.context.res.send(compiled);
};

/**
 * Compile the template.
 * @param  {String} template view
 */

view.compile = function(template) {
  // Create a new context:
  context('global')
    .set('users', [
      { name: 'John' }
    ])

  // Look for views.
  var views = ['body'];

  $ = cheerio.load(template);
  // XXX: Need to figure out how to render the other attributes
  //      that are not within a view.
  //      1) We could remove all the views, render the attributes, then
  //         assemble the views back again.
  $('[view]').each(function() {
    this.addClass('view', true);
    // Render each view independently
    view(this.attr('view')).render();
    this.attr('rendering', false);
  });



  // Exclude any views.
  var outer = $('div:not([view]),\
     span:not([view]),\
     section:not([view]),\
     nav:not([view]),\
     header:not([view]),\
     footer:not([view]),\
     summary:not([view]),\
     article:not([view])\
    ');

  outer.find('[each]')
  .each(function() {
    // Create a new context.
    var attr = this.attr('each').split(' ')
      , source = attr[2];

    context(source)
      .array(context('global').get('users'));

    console.log(context(source));

    if (context(source).length() >= 1) {
      for (var i = 0; i < context(source).length(); i++) {
        //console.log(context(attr[2]).vars[i]);
      }
    }

  });

  function text(elem, ctx) {

  }


  return 1;
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
  this.elem = null;
  this.ctx = {};
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

View.prototype.render = function() {
  this.elem = $('[view='+this.name+']');
  var self = this;
};