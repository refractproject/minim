# Master

## Bug Fixes

- Initialising an Element with given meta or attributes as ObjectElement is now
  supported.
- When converting JavaScript values to Refract, objects are now supported.
- JSON De-serialisation will now deserialise an array into an ArrayElement
  instead of plain array.

# 0.17.0 - 2017-06-16

## Breaking

- `Element.toRefract()` and `Element.fromRefract()` have been removed. JSON
  Serialisation is now decoupled from the Element model. A minim namespace
  provides a convenience `toRefract(element)` and `fromRefract(object)`
  methods.

- `ArrayElement` `children` method has been replaced by a `children` property
  on all elements. You may now chain children in conjunction with `filter` to
  get the existing behaviour.

  Before:

  ```js
  const numbers = doc.children((element) => element.element == 'number');
  ```

  After:

  ```js
  const numbers = doc.children.filter((element) => element.element == 'number');
  ```

  *OR*

  ```js
  const numbers = doc.children.findByElement('number');
  ```

- `BaseElement` has been renamed to `Element`.

- Embedded Refract support has been removed.

## Enhancements

- All elements now contain a `children` and `recursiveChildren` properties that
  return an ArrayElement of the respective children elements.
- JSON Serialiser will no longer serialise empty `meta` and `attributes` into
  JSON objects.
- Minim now contains a `RefElement`.
- Element now contains a `toRef()` function to create a ref element referencing
  the element.

# 0.16.0 - 2017-05-04

## Breaking

- Node 0.10 and 0.12 are no longer supported.
- Elements `name` property was removed. There is no longer a name property in
  Refract specification.

## Enhancements

- Elements now provide a `findRecursive` method allowing you to recursively
  find matching elements.
- Added function for remove key in an Object element and Array element

### Array Element

- New `isEmpty` convenience property for determining if an array is empty.

# 0.15.0 - 2017-04-03

- Getters of link element will now return an element
- Meta convenience methods will now return an element

# 0.14.2 - 2016-08-19

- Update Lodash version

# 0.14.1 - 2016-08-17

- Update Uptown to 0.4.1

# 0.14.0 - 2016-04-28

- **BREAKING** The public interface of the `minim` module has changed significantly. List of changes:

  - Removed `toCompactRefract` and `fromCompactRefract`
  - Improved the default refract serialization such that when an element in `attributes` has its own metadata or attributes defined then it will now be refracted when calling `toRefract`

# 0.13.0 - 2015-12-03

- Added support for hyperlinks per [RFC 0008](https://github.com/refractproject/rfcs/blob/b6e390f7bbc960808ba053e172cccd9e4a81a04a/text/0008-add-hyperlinks.md)
- Upgraded Lodash to 3.10.1
- Refract elements will be automatically parsed when found in arrays in `meta`

# 0.12.3 - 2015-11-30

- When an element in `meta` has its own metadata or attributes defined then it will now be refracted when calling `toRefract` or `toCompactRefract`.
- When loading from refract or compact refract, if an item in `meta` looks like an element it will be loaded as such. This may cause false positives.

# 0.12.2 - 2015-11-24

- Fix a bug related to setting the default key names that should be treated as refracted elements in element attributes. This is now accomplished via the namespace: `namespace._elementAttributeKeys.push('my-value');`. This fixes bugs related to overwriting the `namespace.BaseElement`.

# 0.12.1 - 2015-11-24

- Fix a bug when loading refracted attributes from compact refract.

# 0.12.0 - 2015-11-23

- Provide a way for elements to mark attributes as unrefracted arrays of
  refracted elements. Subclassed elements can push onto the
  `_attributeElementArrayKeys` property to use this feature. **Note**: in the
  future this feature may go away.
- Allow `load` to be used for plugins where a namespace is not being used
- Add an `elements` property to the `Namespace` class which returns an object of PascalCased element name keys to registered element class values. This allows for ES6 use cases like:

  ```js
  const {StringElement, ArrayElement, ObjectElement} = namespace.elements;
  ```

- Add functionality for Embedded Refract

# 0.11.0 - 2015-09-07

- **BREAKING** The public interface of the `minim` module has changed significantly. List of changes:

  - `ElementRegistry` has been renamed to `Namespace`.
  - `minim` has only one public method, called `namespace`, which creates a new `Namespace` instance.
  - `minim.convertToElement` is now `namespace.toElement`
  - `minim.convertFromRefract` is now `namespace.fromRefract`
  - `minim.convertFromCompactRefract` is now `namespace.fromCompactRefract`
  - `minim.*Element` are removed (except for `namespace.BaseElement`). These should be accessed via `namespace.getElementClass('name')` now.
  - The `Namespace` has a new method `use` which loads a plugin namespace and is chainable, e.g. `namespace.use(plugin1).use(plugin2)`.
  - A `Namespace` can be initialized without any default elements by passing an options object with `noDefault` set to `false` to the constructor. They can be initialized later via the `useDefault` method.

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
