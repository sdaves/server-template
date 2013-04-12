var exports = module.exports = view;

exports.views = {};

function view(name) {
  if (!name) throw new Error("Views need a name.");

  if (exports.views[name])
    return exports.views[name];

  return exports.views[name] = new View({
    name: name
  });
}


function View(options) {
  this.name = options.name;
  this.children = {};
}


View.prototype.child = function(name) {
  this.children[name] = view(name);
  return this;
};

View.prototype.swap = function(from, to) {
  this.children[from] = view(to);
};