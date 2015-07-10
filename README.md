# Minim

[![Build Status](https://travis-ci.org/refractproject/minim.svg?branch=master)](https://travis-ci.org/refractproject/minim)

A library for interacting with [Refract elements](https://github.com/refractproject/refract-spec)

## Install

```shell
npm install minim
```

## About

In working with the XML-based DOM, there is a limitation on what types are available in the document. Element attributes may only be strings, and element values can only be strings, mixed types, and nested elements.

JSON provides additional types, which include objects, arrays, booleans, and nulls. A plain JSON document, though, provides no structure and no attributes for each property and value in the document.

Refract is a JSON structure for JSON documents to make a more flexible document object model. In Refract, each element has three components:

1. Name of the element
1. Metadata
1. Attributes
1. Content (which can be of different elements depending on the element)

An element ends up looking like this:

```javascript
var el = {
  element: 'string',
  meta: {},
  attributes: {},
  content: 'bar'
};
```

## Usage

### Converting Javascript Values into Elements

```javascript
var minim = require('minim');
var arrayElement = minim.convertToElement([1, 2, 3]);
var refract = arrayElement.toRefract();
```

The `refract` variable above has the following JSON value.

```json
{
  "element": "array",
  "meta": {},
  "attributes": {},
  "content": [
    {
      "element": "number",
      "meta": {},
      "attributes": {},
      "content": 1
    },
    {
      "element": "number",
      "meta": {},
      "attributes": {},
      "content": 2
    },
    {
      "element": "number",
      "meta": {},
      "attributes": {},
      "content": 3
    }
  ]
}
```

### Converting Serialized Refract into Elements

Serialized Refract can be converted back to Minim elements to make a roundtrip.

```javascript
var arrayElement1 = minim.convertToElement([1, 2, 3]);
var refracted = arrayElement1.toRefract();
var arrayElement2 = minim.convertFromRefract(refracted);
```

### Extending elements

You can extend elements using the `extend` static method.

```javascript
var NewElement = StringElement.extend({
  constructor: function() {
    this.__super();
  },

  customMethod: function() {
    // custom code here
  }
})
```

See the [Uptown](https://github.com/smizell/uptown) library for usage with `.extend`.

### Element Attributes

Each Minim element provides the following attributes:

- element (string) - The name of the element
- meta (object) - The element's metadata
- attributes (object) - The element's attributes
- content - The element's content, e.g. a list of other elements.

### Element Methods

Each Minim element provides the following the methods.

#### toValue

The `toValue` method returns the JSON value of the Minim element.

```javascript
var arrayElement = minim.convertToElement([1, 2, 3]);
var arrayValue = arrayElement.toValue(); // [1, 2, 3]
```

#### toRefract

The `toRefract` method returns the Refract value of the Minim element.

```javascript
var arrayElement = minim.convertToElement([1, 2, 3]);
var refract = arrayElement.toRefract(); // See converting to elements above
```

#### toCompactRefract

The `toCompactRefract` method returns the Compact Refract value of the Minim element.

```javascript
var stringElement = minim.convertToElement("foobar");
var compact = stringElement.toCompactRefract(); // ['string', {}, {}, 'foobar']
```

#### equals

Allows for testing equality with the content of the element.

```javascript
var stringElement = minim.convertToElement("foobar");
stringElement.equals('abcd'); // returns false
```

#### toRef

Converts an element to a referenced element. The `ref` element provides an
`instance` property that contains the original element;

```javascript
var stringElement = new minim.StringElement('foo', { id: 'bar' });
var ref = stringElement.toRef()
ref.toCompactRefract(); // ['ref', {}, {}, { href: 'bar' }]
ref.instance === stringElement // true
```

### Minim Elements

Minim supports the following primitive elements

#### NullElement

This is an element for representing the `null` value.

#### StringElement

This is an element for representing string values.

##### set

The `set` method sets the value of the `StringElement` instance.

```javascript
var stringElement = new minim.StringElement();
stringElement.set('foobar');
var value = stringElement.get() // get() returns 'foobar'
```

#### NumberElement

This is an element for representing number values.

##### set

The `set` method sets the value of the `NumberElement` instance.

```javascript
var numberElement = new minim.NumberElement();
numberElement.set(4);
var value = numberElement.get() // get() returns 4
```

#### BooleanElement

This is an element for representing boolean values.

##### set

The `set` method sets the value of the `BooleanElement` instance.

```javascript
var booleanElement = new minim.BooleanElement();
booleanElement.set(true);
var value = booleanElement.get() // get() returns 4
```

#### ArrayElement

This is an element for representing arrays.

##### Iteration

**NOTE**: Not usable at this point

The array element is iterable.

```js
const arrayElement = new minim.ArrayElement(['a', 'b', 'c']);

for (let item of arrayElement) {
  console.log(item);
}
```

##### get

The `get` method returns the item of the `ArrayElement` instance at the given index.

```javascript
var arrayElement = new minim.ArrayElement(['a', 'b', 'c']);
var value = arrayElement.get(0) // get(0) returns item for 'a'
```

##### getValue

The `getValue` method returns the value of the item of the `ArrayElement` instance at the given index.

```javascript
var arrayElement = new minim.ArrayElement(['a', 'b', 'c']);
var value = arrayElement.getValue(0) // get(0) returns 'a'
```

##### set

The `set` method sets the value of the `ArrayElement` instance.

```javascript
var arrayElement = new minim.ArrayElement();
arrayElement.set(0, 'z');
var value = arrayElement.get(0) // get(0) returns 'z'
```

##### map

The `map` method may be used to map over an array. Each item given is a Minim instance.

```javascript
var arrayElement = new minim.ArrayElement(['a', 'b', 'c']);
var newArray = arrayElement.map(function(item) {
  return item.element;
}); // newArray is now ['string', 'string', 'string']
```

##### filter

The `filter` method may be used to filter a Minim array. This method returns a Minim array itself rather than a JavaScript array instance.

```javascript
var arrayElement = new minim.ArrayElement(['a', 'b', 'c']);
var newArray = arrayElement.filter(function(item) {
  return item.get() === 'a'
}); // newArray.toValue() is now ['a']
```

##### forEach

The `forEach` method may be used to iterate over a Minim array.

```javascript
var arrayElement = new minim.ArrayElement(['a', 'b', 'c']);
arrayElement.forEach(function(item) {
  console.log(item.toValue())
}); // logs each value to console
```

##### push

The `push` method may be used to add items to a Minim array.

```javascript
var arrayElement = new minim.ArrayElement(['a', 'b', 'c']);
arrayElement.push('d');
console.log(arrayElement.toValue()); // ['a', 'b', 'c', 'd']
```

##### find

The `find` method traverses the entire descendent element tree and returns an `ArrayElement` of all elements that match the conditional function given.

```javascript
var arrayElement = new minim.ArrayElement(['a', [1, 2], 'b', 3]);
var numbers = arrayElement.find(function(el) {
  return el.element === 'number'
}).toValue(); // [1, 2, 3]
```

##### findByClass

The `findByClass` method traverses the entire descendent element tree and returns an `ArrayElement` of all elements that match the given element name.

##### findByElement

The `findByElement` method traverses the entire descendent element tree and returns an `ArrayElement` of all elements that match the given class.

##### children

The `children` method traverses direct descendants and returns an `ArrayElement` of all elements that match the condition function given.

```javascript
var arrayElement = new minim.ArrayElement(['a', [1, 2], 'b', 3]);
var numbers = arrayElement.children(function(el) {
  return el.element === 'number';
}).toValue(); // [3]
```

Because only children are tested with the condition function, the values `[1, 2]` are seen as an `array` type whose content is never tested. Thus, the only direct child which is a number element is `3`.

##### getById

Search the entire tree to find a matching ID.

```javascript
elTree.getById('some-id');
```

##### contains

Test to see if a collection contains the value given. Does a deep equality check.

```javascript
var arrayElement = new minim.ArrayElement(['a', [1, 2], 'b', 3]);
arrayElement.contains('a'); // returns true
```

##### first

Returns the first element in the collection.

```javascript
var arrayElement = new minim.ArrayElement(['a', [1, 2], 'b', 3]);
arrayElement.first(); // returns the element for "a"
```

##### second

Returns the second element in the collection.

```javascript
var arrayElement = new minim.ArrayElement(['a', [1, 2], 'b', 3]);
arrayElement.second(); // returns the element for "[1, 2]"
```

##### last

Returns the last element in the collection.

```javascript
var arrayElement = new minim.ArrayElement(['a', [1, 2], 'b', 3]);
arrayElement.last(); // returns the element for "3"
```

#### ObjectElement

This is an element for representing objects. Objects store their items as an ordered array, so they inherit most of the methods above from the `ArrayElement`.

##### get

The `get` method returns the `ObjectElement` instance at the given name.
See `getKey` and `getMember` for ways to get more instances around a key-value pair.

```javascript
var objectElement = new minim.ObjectElement({ foo: 'bar' });
var value = objectElement.get('foo') // returns string instance for 'bar'
```

##### getValue

The `getValue` method returns the value of the `ObjectElement` instance at the given name.

```javascript
var objectElement = new minim.ObjectElement({ foo: 'bar' });
var value = objectElement.getValue('foo') // returns 'bar'
```

##### getKey

The `getKey` method returns the key element of a key-value pair.

```javascript
var objectElement = new minim.ObjectElement({ foo: 'bar' });
var key = objectElement.getKey('foo') // returns the key element instance
```

##### getMember

The `getMember` method returns the entire member for a key-value pair.

```javascript
var objectElement = new minim.ObjectElement({ foo: 'bar' });
var member = objectElement.getMember('foo') // returns the member element
var key = member.key; // returns what getKey('foo') returns
var value = member.value; // returns what get('foo') returns
```

##### set

The `set` method sets the value of the `ObjectElement` instance.

```javascript
var objectElement = new minim.ObjectElement();
objectElement.set('foo', 'hello world');
var value = objectElement.get('foo') // get('foo') returns 'hello world'
```

##### keys

The `keys` method returns an array of keys.

```javascript
var objectElement = new minim.ObjectElement({ foo: 'bar' });
var keys = objectElement.keys() // ['foo']
```

##### values

The `values` method returns an array of keys.

```javascript
var objectElement = new minim.ObjectElement({ foo: 'bar' });
var values = objectElement.values() // ['bar']
```

##### items

The `items` method returns an array of key value pairs which can make iteration simpler.

```js
const objectElement = new minim.ObjectElement({ foo: 'bar' });

for (let [key, value] of objectElement.items()) {
  console.log(key, value); // foo, bar
}
```

##### map, filter, and forEach

The `map`, `filter`, and `forEach` methods work similar to the `ArrayElement` map function, but the callback receive the value, key, and member element instances.

See `getMember` to see more on how to interact with member elements.

```js
const objectElement = new minim.ObjectElement({ foo: 'bar' });
const values = objectElement.map((value, key, member) => {
  // key is an instance for foo
  // value is an instance for bar
  // member is an instance for the member element
  return [key.toValue(), value.toValue()]; // ['foo', 'bar']
});
```

### Element Registry

Minim allows you to register custom elements. For example, if the element name you wish to handle is called `category` and it should be handled like an array:

```javascript
var minim = require('minim');

// Register your custom element
minim.registry.register('category', minim.ArrayElement);

// Load serialized refract elements that includes the new element
var elements = minim.fromCompactRefract(['category', {}, {}, [
  ['string', {}, {}, 'hello, world']
]]);

console.log(elements.get(0).content); // hello, world

// Unregister your custom element
minim.registry.unregister('category');
```

### Chaining

Methods may also be chained when using getters and setters.

```javascript
var objectElement = new minim.ObjectElement()
  .set('name', 'John Doe')
  .set('email', 'john@example.com')
  .set('id', 4)
```
