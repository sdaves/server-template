# Tower View (Server)

A server-side view engine that's extremely fast, reliable and has a kick-ass API.

## Installation

`npm install tower-server-view`


## Usage

First, require the module:

```javascript
var view = require('tower-server-view');
```

Creating a view:

```javascript
view('name');
```

Creating child views:

```javascript
view('index')
  .child('anotherView');

view('anotherView');
```

Swapping child views:

```javascript
view('index')
  .child('menu1');

view('menu1');
view('menu2');

view('index').swap('menu2');
```

## Contexts

A context is a content registry to be used within a view. Contexts are hierarchical and lookups happen at the specified context all the way up it's parent and repeats until we find the variable, or we can't find any more parents and we can't find the variable.

Creating a context:

```javascript
context('singleContext');
```

The context API follows the same API pattern as the routes module. This allows for a standardization around Tower.

Creating a child contexts:

```javascript
context('parent')
  .child('childOne')
  .child('childTwo');
```

You can have an infinite amount of child contexts.

Creating a variable within a context:

```javascript
context('single')
  .set('var', 1);
```

Variables can contain any value.

There's always a single global context created automatically that specifies the "global" scope. You can directly use the global context...

```javascript
context('global')
 .set('var', 1);
```

Then within a view:

```html
<html>
  <body>
    <span data-text="var"></span> <!-- The span will be filled in with `1` -->
  </body>
</html>
```