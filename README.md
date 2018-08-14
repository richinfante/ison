# ISON

[![Build Status](https://travis-ci.org/richinfante/ison.svg?branch=master)](https://travis-ci.org/richinfante/ison)
[![npm](https://img.shields.io/npm/v/ison.svg)](http://npmjs.com/ison)
![license](https://img.shields.io/github/license/richinfante/ison.svg)

**Warning: Mostly stable. Should not be relied on for production use yet.**

A better object notation with Date and custom types support, Comments, and _JSON compatibility<sup>*</sup>_.

## Supported Built-in Types
- [x] String (and primitives)
  - [x] Single quotes
  - [x] Double quotes
- [x] Number (and primitives)
  - [x] NaN
  - [x] Infinity
  - [x] Hex representation (`0xa1b2c3`)
  - [x] Oct representation (`0o134717`)
  - [x] Bin representation (`0b101011`)
  - [x] Dec representation (`-1000`, `1000.324`)
  - [x] Exp representation (`2.99e8`)
- [x] Boolean (and primitives)
- [x] Array (and literals)
- [x] Object (and literals)
  - [x] quoted keys
  - [x] bare keys
- [x] Maps
- [x] Sets
- [x] RegExp

## Examples:

ISON allows for dates, as well as a more relaxed syntax. we do not require keys to be quoted, as long as the conform to the regex `/[a-zA-Z_][_a-zA-Z0-9]*/`. Arbitrary keys must be quoted strings, but for a well designed schema this should not be required.


### Dates
Dates are serialized using their UNIX timestamps. Although this implementation is in JavaScript, implementations should load this into their native date APIs.

```js
Date(1532524806137)
```

### Numbers
The following number formats are allowed. Note: the C-style syntax for octals is not supported (leading `0`), as it it can be confusing.

```js
{
  a: 0xFF,  // Hex
  b: 0b11111111,  // Binary
  c: 0o377, // Octal
  d: 255 // Decimal
}
```

### Booleans

```js
{
  a: true,
  b: false
}
```

### Strings
Strings can use either single or double quotes.

### Types

ISON also supports buffers, maps, sets, and regular expressions! Implementing languages should convert these to their native equivalents.

```js
{
  // Dates via unix timestamp
  created: Date(1532571987475),

  // Buffers stored in hex, ascii, etc.
  data: Buffer('deadbeef', 'hex'),
  name: Buffer('hello, world!', 'ascii'),

  // Regular expressions
  regex: RegExp('0x[a-f0-9]+', 'i'),

  // Sets
  set: Set([ 1,2,3,4 ]),

  // Maps
  map: Map([
    ['abc', 'def'],
    ['ghi', 'jkl']
  ])
}
```

### Objects
Object keys do not need to be quoted, unless they do not match the following regex: `/[a-z_][_a-z0-9]*/i`. Additionally, these are equivalent, but the latter of the two is preferred because it is more concise.

```js
Object({ a: 1 }) === { a: 1 }
```

### Arrays
The same follows for arrays. These are equivalent, but the latter of the two is preferred because it is more concise.
```js
Array( 1, 2, 3 ) === [ 1, 2, 3 ]
```

## Custom Types
ISON now includes a custom types interface. This takes advantage of destructuring, but also allows for you to rename the types as they are exposed to the ISON parser. For completeness, it is recommended you provide a `destructor()` function for your custom types.

In cases where you need to override the detected type name of an object, you may use the `className` property. In most cases, this is __not necessary and you shouldn't use this**.

```js
const ison = require('./ison')

// Define a few types
ison.addTypes({ 
  MySpecialType,
  MyOtherType
})

// Remove them
ison.removeTypes({
  MyOtherType  
})
```

In order to make a type compatible (i.e. stringify-able) from ISON, you must define a "destructor" on the instance. The values returned from the destructor are passed into the object's constructor.

```js
const ison = require('ison')

class Location {
  constructor({ latitude, longitude }) {
    this.latitude = latitude
    this.longitude = longitude
  }

  destructor() {
    return { 
      latitude: this.latitude, 
      longitude: this.longitude
    }
  }
}
ison.addTypes({ Location }) // Required for parsing locations back into a Location instance
ison.stringify(new Location({ latitude: 12.3456, longitude: 98.6765 })) // -> 'Location({latitude:12.3456,longitude:98.6765})'
```

However, if we are adding multiple arguments (or the only argument is an array) the destructor must return an array.
```js
const ison = require('ison')

class List {
  constructor(items) {
    this.items = items
  }

  destructor() {
    // For anything besides an object return, you MUST use an array to specify arguments
    return [ this.items ]
  }
}

// If we run:
ison.addTypes({ List }) // Required for parsing Lists back into a List instance
ison.stringify(new List([ 'make breakfast', 'go to the gym' ])) // -> List(["make breakfast","go to the gym"])
```

Multiple arguments example:
```js
const ison = require('./')

class Point {
  constructor(x,y,z) {
    this.x = x
    this.y = y
    this.z = z
  }

  destructor() {
    // For anything besides an object return, you MUST use an array to specify arguments
    return [ this.x, this.y, this.z ]
  }
}

// If we run: 
ison.stringify(new Point(234, 345, 6778)) // -> 'Point(234,345,6778)'
ison.addTypes({ Point }) // Required for parsing the point back into a Point instance
ison.parse('Point(234,345,6778)') // Returns a new point instance with x,y,z.
```
## FAQ
- Doesn't this format take up more space?
  - Not necessarily. Often, it's actually smaller. This is due to the fact that most JSON typing is often done using a field named `type` and then attaching all of the other data to it as well.
  - Also, the requirement for most dictionary keys to be quoted has been dropped, removing much more wasted space.
- How much space does ISON use?
  - the minified version is only ~4.7kb
  - the production versions of ISON in the `dist/` folder have no dependencies (other than standard JavaScript).

## Notes
- <sup>*</sup> All valid JSON documents are valid ISON documents, but the converse is not true.
