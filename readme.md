# NUON

**DISCLAIMER: This package is experimental. Although it should be stable for most cases, you most likely shouldn't trust it yet for production use**

UON is a more powerful cousin to JSON. It allows for serialization of dates, and other user types. It is technically a subset of Javascript, so it is theoretically possible to run directly in a Javascript interpreter.

## Examples:

NUON allows for dates, as well as a more relaxed syntax. we do not require keys to be quoted, as long as the conform to the regex `/[a-zA-Z_][_a-zA-Z0-9]*/`. Arbitrary keys must be quoted strings, but for a well designed schema this should not be required.

Notation for custom objects uses a function-like syntax. Essentially, it mimics the object's constructor. The `new` is not allowed or required in NUON however, since it is a notation and not a scripting language.

```js
{

  website: "Blog example",
  posts: [{
    title: "My first post!",
    published: Date(1532524806137),
    content: 'Hello, World!',
    author: '@richinfante'
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

```js
{
  vehicles: [{
    serialNumber: 'BUS-122',
    route: 12,
    status: 'On Time',
    location: {
      $type: 'Location',
      latitude: 40.7484,
      longitude: -73.9857
    }
  }]
}
```

NUON also supports buffers!
```js
{
  data: Buffer('deadbeef', 'hex'),
  name: Buffer('hello, world!', 'ascii')
}
```