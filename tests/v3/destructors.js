const tap = require('tap')
const ison = require(process.env.PARSER_FILE || '../../parser.js')

class ExamplePerson {
  constructor(name, age) {
    this.name = name
    this.age = age
  }

  getNametag() {
    return this.name + ', age: ' + this.age
  }

  destructor() {
    return [ this.name, this.age ]
  }
}

class Example2 {
  constructor({ name, age }) {
    this.name = name
    this.age = age
  }

  getNametag() {
    return this.name + ', age: ' + this.age
  }

  destructor() {
    return { name: this.name, age: this.age }
  }
}

ison.addTypes({
  ExamplePerson,
  Example2
})

// Test date serialization
tap.test('array destructor', function (childTest) {
  let p1 = new ExamplePerson('Alice', 128)
  let string = ison.stringify(p1)
  let p2 = ison.parse(string)
  
  childTest.strictSame(p1, p2, 'stringify-parse yields same object')
  childTest.ok(p2 instanceof ExamplePerson, 'correct class is instantiated')
  childTest.strictSame(p1.getNametag(), p2.getNametag(), 'correct class is instantiated')
  
  childTest.end()
})

// Test date serialization
tap.test('object destructor', function (childTest) {
  let p1 = new Example2({ name: 'Alice', age: 128})
  let string = ison.stringify(p1)
  let p2 = ison.parse(string)

  childTest.strictSame(p1, p2, 'stringify-parse yields same object')
  childTest.ok(p2 instanceof Example2, 'correct class is instantiated')
  childTest.strictSame(p1.getNametag(), p2.getNametag(), 'correct class is instantiated')
  
  childTest.end()
})