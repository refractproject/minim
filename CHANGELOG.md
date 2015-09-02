# Unreleased

- **BREAKING** The public interface of the `minim` module has changed significantly. List of changes:

  - `ElementRegistry` has been renamed to `Namespace`.
  - `minim` has only one public method, called `namespace`, which creates a new `Namespace` instance.
  - `minim.convertToElement` is now `namespace.toElement`
  - `minim.convertFromRefract` is now `namespace.fromRefract`
  - `minim.convertFromCompactRefract` is now `namespace.fromCompactRefract`
  - `minim.*Element` are removed (except for `namespace.BaseElement`). These should be accessed via `namespace.getElementClass('name')` now.
  - The `Namespace` has a new method `use` which loads a plugin namespace and is chainable, e.g. `namespace.use(plugin1).use(plugin2)`.
  - A `Namespace` can be initialized without any default elements by passing `false` to the constructor. They can be initialized later via the `useDefault` method.

  Before:

  ```js
  var minim = require('minim');
  minim.convertToElement([1, 2, 3]);
  ```

  After:

  ```js
  var minim = require('minim');
  var namespace = minim.namespace();
  namespace.toElement([1, 2, 3]);
  ```

- Add a `.toValue()` method to member elements which returns a hash with the key
   and value and their respective values.

# 0.10.0 - 2015-08-18

- Rename the `class` metadata property to `classes`. The convenience property
  is also now called `classes`, e.g. `element.classes.contains('abc')`.

# 0.9.0 - 2015-07-28

- Allow the iterator protocol to be used with arrays and objects if the runtime
  supports it. This enables using `for ... of` loops on elements as well as
  rest operators, destructuring, `yield*`, etc.
- Convenience properties for simple types now return the value result. Instead
  of `element.title.toValue()` you now use `element.title`.
- Add array indexes to `#forEach`.
- Add a `#clone` method.
- Add a `#reduce` method.
- Fix a serialization bug when initializing using falsey values
  (`null`, `0`, `false`).

# 0.8.0 - 2015-07-09

- Allow `#set` to take an object for Object Elements
- Convert `meta` to be Minim Object Elements
- Convert `attributes` to be Minim Object Elements
- Sync class and method names with Refract 0.2.0 spec
- Add convenience methods for `meta` attributes, such as `id` or `class`
- Add finder functions, such as `findByElement` and `findByClass`
- Upgrade to use Uptown 0.4.0
- Organize code
