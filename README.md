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
1. Content (which can be of different types depending on the element)

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

### Converting to Types

```javascript
var minim = require('minim');
var arrayType = minim.convertToType([1, 2, 3]);
var refract = arrayType.toRefract();
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

### Converting from Types

If the JSON above is used, it can be converted back to Minim types to make a roundtrip.

```javascript
var arrayType = minim.convertFromDom(aboveJson);
```

### Element Attributes

Each Minim type provides the following attributes:

- element (string) - The name of the element type.
- meta (object) - The element's metadata
- attributes (object) - The element's attributes
- content - The element's content, e.g. a list of other elements.

### Element Methods

Each Minim type provides the following the methods.

#### toValue

The `toValue` method returns the JSON value of the Minim element.

```javascript
var arrayType = minim.convertToType([1, 2, 3]);
var arrayValue = arrayType.toValue(); // [1, 2, 3]
```

#### toRefract

The `toRefract` method returns the Refract value of the Minim element.

```javascript
var arrayType = minim.convertToType([1, 2, 3]);
var refract = arrayType.toRefract(); // See converting to types above
```

#### toCompactRefract

The `toCompactRefract` method returns the Compact Refract value of the Minim element.

```javascript
var stringType = minim.convertToType("foobar");
var compact = stringType.toCompactRefract(); // ['string', {}, {}, 'foobar']
```

#### equals

Allows for testing equality with the content of the element.

```javascript
var stringType = minim.convertToType("foobar");
stringType.equals('abcd'); // returns false
```

### Element Types

Minim supports the following primitive types and the

#### NullType

This is a type for representing the `null` value.

#### StringType

This is a type for representing string values.

##### set

The `set` method sets the value of the `StringType` instance.

```javascript
var stringType = new minim.StringType();
stringType.set('foobar');
var value = stringType.get() // get() returns 'foobar'
```

#### NumberType

This is a type for representing number values.

##### set

The `set` method sets the value of the `NumberType` instance.

```javascript
var numberType = new minim.NumberType();
numberType.set(4);
var value = numberType.get() // get() returns 4
```

#### BoolType

This is a type for representing boolean values.

##### set

The `set` method sets the value of the `BoolType` instance.

```javascript
var boolType = new minim.BoolType();
boolType.set(true);
var value = boolType.get() // get() returns 4
```

#### ArrayType

This is a type for representing arrays.

##### Iteration

The array type is iterable.

```js
const arrayType = new minim.ArrayType(['a', 'b', 'c']);

for (let item of arrayType) {
  console.log(item);
}
```

##### get

The `get` method returns the item of the `ArrayType` instance at the given index.

```javascript
var arrayType = new minim.ArrayType(['a', 'b', 'c']);
var value = arrayType.get(0) // get(0) returns 'a'
```

##### set

The `set` method sets the value of the `ArrayType` instance.

```javascript
var arrayType = new minim.ArrayType();
arrayType.set(0, 'z');
var value = arrayType.get(0) // get(0) returns 'z'
```

##### map

The `map` method may be used to map over an array. Each item given is a Minim instance.

```javascript
var arrayType = new minim.ArrayType(['a', 'b', 'c']);
var newArray = arrayType.map(function(item) {
  return item.element;
}); // newArray is now ['string', 'string', 'string']
```

##### filter

The `filter` method may be used to filter a Minim array. This method returns a Minim array itself rather than a JavaScript array instance.

```javascript
var arrayType = new minim.ArrayType(['a', 'b', 'c']);
var newArray = arrayType.filter(function(item) {
  return item.get() === 'a'
}); // newArray.toValue() is now ['a']
```

##### forEach

The `forEach` method may be used to iterate over a Minim array.

```javascript
var arrayType = new minim.ArrayType(['a', 'b', 'c']);
arrayType.forEach(function(item) {
  console.log(item.toValue())
}); // logs each value to console
```

##### push

The `push` method may be used to add items to a Minim array.

```javascript
var arrayType = new minim.ArrayType(['a', 'b', 'c']);
arrayType.push('d');
console.log(arrayType.toValue()); // ['a', 'b', 'c', 'd']
```

##### find

The `find` method traverses the entire descendent element tree and returns an `ArrayType` of all elements that match the conditional function given.

```javascript
var arrayType = new minim.ArrayType(['a', [1, 2], 'b', 3]);
var numbers = arrayType.find(function(el) {
  return el.element === 'number'
}).toValue(); // [1, 2, 3]
```

##### children

The `children` method traverses direct descendants and returns an `ArrayType` of all elements that match the condition function given.

```javascript
var arrayType = new minim.ArrayType(['a', [1, 2], 'b', 3]);
var numbers = arrayType.children(function(el) {
  return el.element === 'number';
}).toValue(); // [3]
```

Because only children are tested with the condition function, the values `[1, 2]` are seen as an `array` type whose content is never tested. Thus, the only direct child which is a number type is `3`.

##### getById

Search the entire tree to find a matching ID.

```javascript
elTree.getById('some-id');
```

##### contains

Test to see if a collection contains the value given. Does a deep equality check.

```javascript
var arrayType = new minim.ArrayType(['a', [1, 2], 'b', 3]);
arrayType.contains('a'); // returns true
```

##### first

Returns the first element in the collection.

```javascript
var arrayType = new minim.ArrayType(['a', [1, 2], 'b', 3]);
arrayType.first(); // returns the element for "a"
```

##### second

Returns the second element in the collection.

```javascript
var arrayType = new minim.ArrayType(['a', [1, 2], 'b', 3]);
arrayType.second(); // returns the element for "[1, 2]"
```

##### last

Returns the last element in the collection.

```javascript
var arrayType = new minim.ArrayType(['a', [1, 2], 'b', 3]);
arrayType.last(); // returns the element for "3"
```

#### ObjectType

This is a type for representing objects. Objects store their items as an ordered array, so they inherit most of the methods above from the `ArrayType`.

##### get

The `get` method returns the value of the `ObjectType` instance at the given name.
See `getKey` and `getMember` for ways to get more instances around a key-value pair.

```javascript
var objectType = new minim.ObjectType({ foo: 'bar' });
var value = objectType.get('foo') // returns string instance for 'bar'
```

##### getKey

The `getKey` method returns the key element of a key-value pair.

```javascript
var objectType = new minim.ObjectType({ foo: 'bar' });
var key = objectType.getKey('foo') // returns the key element instance
```

##### getMember

The `getMember` method returns the entire member for a key-value pair.

```javascript
var objectType = new minim.ObjectType({ foo: 'bar' });
var member = objectType.getMember('foo') // returns the member element
var key = member.key; // returns what getKey('foo') returns
var value = member.value; // returns what get('foo') returns
```

##### set

The `set` method sets the value of the `ObjectType` instance.

```javascript
var objectType = new minim.ObjectType();
objectType.set('foo', 'hello world');
var value = objectType.get('foo') // get('foo') returns 'hello world'
```

##### keys

The `keys` method returns an array of keys.

```javascript
var objectType = new minim.ObjectType({ foo: 'bar' });
var keys = objectType.keys() // ['foo']
```

##### values

The `values` method returns an array of keys.

```javascript
var objectType = new minim.ObjectType({ foo: 'bar' });
var values = objectType.values() // ['bar']
```

##### items

The `items` method returns an array of key value pairs which can make iteration simpler.

```js
const objectType = new minim.ObjectType({ foo: 'bar' });

for (let [key, value] of objectType.items()) {
  console.log(key, value); // foo, bar
}
```

##### map, filter, and forEach

The `map`, `filter`, and `forEach` methods work similar to the `ArrayType` map function, but the callback receive the value, key, and member element instances.

See `getMember` to see more on how to interact with member elements.

```js
const objectType = new minim.ObjectType({ foo: 'bar' });
const values = objectType.map((value, key, member) => {
  // key is an instance for foo
  // value is an instance for bar
  // member is an instance for the member element
  return [key.toValue(), value.toValue()]; // ['foo', 'bar']
});
```

### Element Registry

Minim allows you to register custom types for elements. For example, if the element type name you wish to handle is called `category` and it should be handled like an array:

```javascript
var minim = require('minim');

// Register your custom type
minim.registry.register('category', minim.ArrayType);

// Load serialized refract elements that include the type!
var elements = minim.fromCompactRefract(['category', {}, {}, [
  ['string', {}, {}, 'hello, world']
]]);

console.log(elements.get(0).content); // hello, world

// Unregister your custom type
minim.registry.unregister('category');
```

### Chaining

Methods may also be chained when using getters and setters.

```javascript
var objectType = new minim.ObjectType()
  .set('name', 'John Doe')
  .set('email', 'john@example.com')
  .set('id', 4)
```
