
/**
 * Module dependencies.
 */

var reactive = require('reactive')
  , Emitter  = require('tower-emitter');

/**
 * Expose `view`.
 */

exports = module.exports = view;

/**
 * Registry of all contexts.
 *
 * @type {Object}
 */

exports.contexts = {};

/**
 * Create or retrieve an existing context.
 *
 * @param {String} name
 */

function context(name, parent) {
  if (!name) throw new Error("You need to specify a name within a context.");

  if (exports.contexts[name]) return exports.contexts[name];

  return exports.contexts[name] = new Context({
      name: name
    , parent: parent
  });
}

/**
 * Instantiate a new `Context`.
 *
 * @param {Object} options
 */

function Context(options) {
  this.name = options.name;
  this.parent = context(options.parent);
  this.children = {};
  this.scope = new Scope();
}

/**
 * Setter
 */

Context.prototype.set = function() {

};

/**
 * Getter
 */

Context.prototype.get = function() {

};

/**
 * Instantiate a new `Scope`.
 */

function Scope() {

}

//Emitter(Scope.prototype);

/**
 * Registry of all the views.
 *
 * @type {Object}
 */

exports.views = {};

/**
 * Create or retrieve an existing view.
 *
 * @param  {String} name View name
 */

function view(name) {
  if (!name) throw new Error("Views need a name.");

  if (exports.views[name]) return exports.views[name];

  var instance = new View({
      name: name
    , state: ('body' === name) ? 'rendered' : 'not rendered'
  });

  // XXX: view.emit('defined', instance);

  return exports.views[name] = instance;
}

/**
 * Initialize the client-side views. This means we have
 * to re-render most elements to provide data-bindings.
 *
 * The setup is pretty simple. All views that were not rendered
 * by the server are contained within `script` tags inside the
 * `body` element. `<script type="text/view" data-view="name"></script>`
 *
 * The rendered views are contained within the `body` element.
 * There can be many views there.
 *
 * We need to first find all the
 * views not-rendered and tag each view instance with the script
 * element we find.
 *
 * Second, we need to find all the views that are rendered.
 * And we can tag each view instance with the view element.
 *
 * Each binding coming from the server (data-each, etc...) will have
 * it's own template (the original binding markup) within `script`
 * tags. We need to first, clean the DOM up (remove looped elements)
 * and remove the template and place the original markup back into the
 * DOM.
 *
 * Once we cleaned everything up, we can proceed to rendering
 * the view. We need to first see what views they are wanting to
 * render. Chances are that the views coming from the server are
 * the same, but we still need to double check.
 *
 * We render each view
 *  - Remove sub-views (place them within script tags or
 *    similar to the server rendering.)
 *  - Render each binding within a view
 *  - Implement events (has priority because a user might
 *    already be trying to click on elements or perform actions.)
 *  - Replace the sub-views back
 *  - Render the sub-views (repeat view rendering)
 *  (Fire appropriate events - like when the views are rendered or
 *  before they are rendered and after.)
 *
 * + Find the top most view ('body') and find it's children.
 *   If it's children are not rendered, then render them, otherwise
 *   render the children.
 *
 * @return {[type]}
 */

view.init = function(){
  // Find all the non-rendered views and their instance.
  $(document).find('script[type="text/view"]').each(function(){
    var elem = $(this)
      , name = elem.attr('name');

    view(name)._state('not rendered');
    view(name).elem = elem;
  });

  $(document).find('[view]').each(function(){
    var elem = $(this)
      , name = elem.attr('view');

    // Set the state to `rendered`
    view(name)._state('rendered');
    view(name).elem = elem;
  });

  var bodyView = view('body');

  function recurseViews(viewObj, parent) {
    if (!parent) parent = viewObj;

    if ('not rendered' === viewObj.state) {
      parent.elem.append(viewObj.elem);
    }

    if (viewObj.hasChildren()) {
      for (var key in viewObj.children) {
        var child = viewObj.children[key];
        recurseViews(child, parent);
      }
    }
  }

  recurseViews(bodyView);
};

/**
 * View constructor.
 *
 * @param {Object} options
 */

function View(options) {
  this.name = options.name;
  this.children = {};
  this.state = options.state || 'not rendered';
  this.elem = null;

  if ('body' === this.name) {
    this.elem = $('body');
  }
}

Emitter(View.prototype);

/**
 * Create a new child view.
 *
 * @param {String} name View name
 */

View.prototype.child = function(name){
  this.children[name] = view(name);
  return this;
};

/**
 * Return true if the view has any child views
 *
 * @return {Boolean}
 */

View.prototype.hasChildren = function(){
  return !!Object.keys(this.children).length;
}

/**
 * Set or get the current state
 *
 * @param {String} state
 * @return {View}
 */

View.prototype._state = function(state, boolean){
  if (2 === arguments.length) this.state = state;
  return this.state;
};

/**
 * Swap a view with another view.
 *
 * @param {String} from View to swap
 * @param {String} to   View to replace with.
 */

View.prototype.swap = function(from, to){
  this.children[from] = view(to);
  return this;
};