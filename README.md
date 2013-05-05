# Tower View (Client)

[![Build Status](https://travis-ci.org/tower/client-view.png)](https://travis-ci.org/tower/client-view)


## Installation

```
component install tower/view
```

## Example

## Testing

For client-side testing, build:

```
component install -d
component build -d
```

Then view `test/index.html` in the browser:

```
open test/index.html
```

## Notes

Data-binding occurs purely on the DOM and has no dependence no "views". This means the `view` doesn't have any data binding code. This `view` module just provides a simple API to the DOM.

## License

MIT