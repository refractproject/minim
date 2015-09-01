# Unreleased

- **BREAKING** The `minim` module is now an instance of an `ElementRegistry`. The registry has been updated to allow loading namespaces via the `use` method. List of changes:

 * `minim.convertToElement` is now `minim.toElement`
 * `minim.convertFromRefract` is now `minim.fromRefract`
 * `minim.convertFromCompactRefract` is now `minim.fromCompactRefract`
 * `minim.*Element` are removed (except for `BaseElement`). These should be accessed via `minim.getElementClass('name')` now.
 * The `minim` module is now just a simple instance of `ElementRegistry`.
 * The `ElementRegistry` has a new method `use` which loads a namespace and is chainable, e.g. `minim.use(namespace1).use(namespace2)`.
 * An `ElementRegistry` can be initialized without any default elements by passing `false` to the constructor. They can be initialized later via the `useDefault` method.
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
