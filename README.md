# Tower View (Client)

[![Build Status](https://travis-ci.org/tower/client-view.png)](https://travis-ci.org/tower/client-view)

## Installation

```bash
$ component install tower/view
```

## Example

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

## Notes

Data-binding occurs purely on the DOM and has no dependence no "views". This means the `view` doesn't have any data binding code. This `view` module just provides a simple API to the DOM.

- http://jsperf.com/apply-vs-call-vs-invoke/13
- https://github.com/angular/angular.js/pull/1198
- http://ngmodules.org/all
- https://github.com/yeoman/generator-angular/issues/109
- https://github.com/angular/angular-component-spec
- http://www.codinghorror.com/blog/2008/05/understanding-model-view-controller.html

## License

MIT

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/tower/client-view/trend.png)](https://bitdeli.com/free "Bitdeli Badge")