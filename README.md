# Minim

[![Build Status](https://travis-ci.org/smizell/minim.svg)](https://travis-ci.org/smizell/minim)

A library for interacting with JDOM elements

## Install

```shell
npm install minim
```

## About

In working with the XML-based DOM, there is a limitation on what types are available in the document. Element attributes may only be strings, and element values can only be strings, mixed types, and nested elements.

JSON provides additional types, which include objects, arrays, booleans, and nulls. A plain JSON document, though, provides no structure and no meta data about each property and value in the document.

JDOM is a JSON structure for JSON documents to make a more flexible document object model. In JDOM, each element has three components:

1. Name of the element
1. Attributes (or in this library, meta)
1. Content (which can be of different types depending on the element)

An element ends up looking like this:

```javascript
var el = {
  element: 'string',
  meta: {},
  content: 'bar'
};
```

## Usage

### Converting to Types

```javascript
var minim = require('minim');
var arrayType = minim.convertToType([1, 2, 3]);
var jdom = arrayType.toDom();
```

The `jdom` variable above has the following JSON value.

```json
{
  "element": "array",
  "meta": {},
  "content": [
    {
      "element": "number",
      "meta": {},
      "content": 1
    },
    {
      "element": "number",
      "meta": {},
      "content": 2
    },
    {
      "element": "number",
      "meta": {},
      "content": 3
    }
  ]
}
```

### Converting from Types

If the JSON above is used, it can be converted back to Minim types to make a roundtrip. As a note, all meta data is lost in a roundtrip.

```javascript
var arrayType = minim.convertFromDom(aboveJson);
```

### Element methods

Once you have set up a type, you then have the following methods.

#### .elementType

```javascript
var arrayType = minim.convertToType([1, 2, 3]);
var elementType = arrayType.elementType(); // array
```

#### .toValue

```javascript
var arrayType = minim.convertToType([1, 2, 3]);
var arrayValue = arrayType.toValue(); // [1, 2, 3]
```

#### .toDom

```javascript
var arrayType = minim.convertToType([1, 2, 3]);
var jdom = arrayType.toDom(); // See converting to types above
```
