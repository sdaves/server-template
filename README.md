# Tower Template

[![Build Status](https://travis-ci.org/tower/client-view.png)](https://travis-ci.org/tower/client-view)

## Installation

```bash
$ component install tower/template
```

## Example

```js
var template = require('tower-template');
var element = document.querySelector('#todos');
var fn = template(element);
fn({ some: 'data' }); // applies "scope" (data) to DOM directives.
```

## Running Tests

For client-side testing, build:

```bash
$ component install -d
$ component build -d
```

Then view `test/index.html` in the browser:

```
open test/index.html
```

## License

MIT

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/tower/client-view/trend.png)](https://bitdeli.com/free "Bitdeli Badge")