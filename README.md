# Minim

[![Build Status](https://travis-ci.org/smizell/minim.svg)](https://travis-ci.org/smizell/minim)

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
1. Attributes
1. Content (which can be of different types depending on the element)

An element ends up looking like this:

```javascript
var el = {
  element: 'string',
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
  "attributes": {},
  "content": [
    {
      "element": "number",
      "attributes": {},
      "content": 1
    },
    {
      "element": "number",
      "attributes": {},
      "content": 2
    },
    {
      "element": "number",
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

### Element Methods

Each Minim type provides the following the methods.

#### elementType

The `elementType` method returns the type of the Minim element.

```javascript
var arrayType = minim.convertToType([1, 2, 3]);
var elementType = arrayType.elementType(); // array
```

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
var compact = stringType.toCompactRefract(); // ['string', {}, 'foobar']
```

### Element Types

Minim supports the following primitive types and the

#### NullType

This is a type for representing the `null` value.

##### get

The `get` method returns the value of the `NullType` instance.

```javascript
var nullType = new minim.NullType();
var value = nullType.get() // get() returns null
```

#### StringType

This is a type for representing string values.

##### get

The `get` method returns the value of the `StringType` instance.

```javascript
var stringType = new minim.StringType('foobar');
var value = stringType.get() // get() returns 'foobar'
```

##### set

The `set` method sets the value of the `StringType` instance.

```javascript
var stringType = new minim.StringType();
stringType.set('foobar');
var value = stringType.get() // get() returns 'foobar'
```

#### NumberType

This is a type for representing number values.

##### get

The `get` method returns the value of the `NumberType` instance.

```javascript
var numberType = new minim.NumberType(4);
var value = numberType.get() // get() returns 4
```

##### set

The `set` method sets the value of the `NumberType` instance.

```javascript
var numberType = new minim.NumberType();
numberType.set(4);
var value = numberType.get() // get() returns 4
```

#### BoolType

This is a type for representing boolean values.

##### get

The `get` method returns the value of the `BoolType` instance.

```javascript
var boolType = new minim.BoolType(true);
var value = boolType.get() // get() returns true
```

##### set

The `set` method sets the value of the `BoolType` instance.

```javascript
var boolType = new minim.BoolType();
boolType.set(true);
var value = boolType.get() // get() returns 4
```

#### ArrayType

This is a type for representing arrays.

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
  return item.elementType();
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

The `find` method traverses the element tree and returns an `ArrayType` of all elements that match the conditional function given.

```javascript
var arrayType = new minim.ArrayType(['a', [1, 2], 'b', 3]);
var numbers = arrayType.find(function(el) {
  return el.elementType() == 'number'
}).toValue(); // [1, 2, 3]
```

#### ObjectType

This is a type for representing objects.

##### get

The `get` method returns the item of the `ObjectType` instance at the given index.

```javascript
var objectType = new minim.ObjectType({ foo: 'bar' });
var value = objectType.get('foo') // get('foo') returns 'bar'
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
var value = objectType.keys() // ['foo']
```

##### values

The `values` method returns an array of keys.

```javascript
var objectType = new minim.ObjectType({ foo: 'bar' });
var value = objectType.values() // ['bar']
```

### Chaining

Methods may also be chained when using getters and setters.

```javascript
var objectType = new minim.ObjectType()
  .set('name', 'John Doe')
  .set('email', 'john@example.com')
  .set('id', 4)
```

### Errors

Minim has its own error type that is passed down through the call chain. This allows clients to write chains that may break but do not throw JavaScript errors.

```javascript
var objectExample = {
  foo: {
    bar: 'value 1'
  }
};

var objectType = minim.ObjectType(objectExample);
var value1 = objectType.get('foo').get('bar'); // value of foo.bar
var notFound = objectType.get('baz').get('foo') // Returns error object
```
