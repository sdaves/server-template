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
  child('anotherView');

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

