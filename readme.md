# NUON

A better object notation with Date and custom types support, and _JSON compatibility_.

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

Notation for custom objects uses a function-like syntax. Essentially, it mimics the object's constructor. The `new` is required (or allowed) in NUON however, since it is a notation and not a scripting language. It is technically a subset of Javascript, however, so it is theoretically possible to run directly in a Javascript interpreter with the correct functions defined.

```js
{
  website: "Blog example",
  posts: [{
    title: "My first post!",
    published: Date(1532524806137),
    content: "Hello, World!",
    author: "@richinfante"
  }]
}
```

We can also utilize custom object constructors such as the follow for location. If a type cannot be found, it is passed into the `Object()` constructor, and then the `$type` variable is set on it.

```js
{
  vehicles: [{
    serialNumber: 'BUS-122',
    route: 12,
    status: 'On Time',
    location: Location({
      latitude: 40.7484,
      longitude: -73.9857
    })
  }]
}
```

When loaded using the NUON js library, it would appear as the following, if no `Location` class is loaded.

```json
{
  "vehicles": [{
    "serialNumber": "BUS-122",
    "route": 12,
    "status": "On Time",
    "location": {
      "$type": "Location",
      "latitude": 40.7484,
      "longitude": -73.9857
    }
  }]
}
```

NUON also supports buffers, maps, sets, and regular expressions!
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