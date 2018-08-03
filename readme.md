# NUON

**Warning: Mostly stable. Should not be relied on for production use yet.**

A better object notation with Date and custom types support, Comments, and _JSON compatibility_.

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
- [x] Boolean (and primitives)
- [x] Array (and literals)
- [x] Object (and literals)
  - [x] quoted keys
  - [x] bare keys
- [x] Maps
- [x] Sets
- [x] RegExp
- [x] Custom objects via `$type`

## Examples:

NUON allows for dates, as well as a more relaxed syntax. we do not require keys to be quoted, as long as the conform to the regex `/[a-zA-Z_][_a-zA-Z0-9]*/`. Arbitrary keys must be quoted strings, but for a well designed schema this should not be required.


### Dates
Dates are serialized using their UNIX timestamps. Although this implementation is in JavaScript, implementations should load this into their native date APIs.

```js
Date(1532524806137)
```

### Numbers
The following number formats are allowed:
```js
{
  a: 0xFF,
  b: 0b11111111,
  c: 0o377,
  d: 255
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

NUON also supports buffers, maps, sets, and regular expressions! Implementing languages should convert these to their native equivalents.

```js
{
  created: Date(1532571987475),
  data: Buffer('deadbeef', 'hex'),
  name: Buffer('hello, world!', 'ascii'),
  regex: RegExp('0x[a-f0-9]+', 'i'),
  set: Set([ 1,2,3,4 ]),
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
The same follows for arays. These are equivalent, but the latter of the two is preferred because it is more concise.
```js
Array( 1, 2, 3 ) === [ 1, 2, 3 ]
```