const tap = require('tap')
const ison = require(process.env.PARSER_FILE || '../../parser.js')

class ExamplePerson {
  constructor(num) {
    this.num = num
  }

  getNametag() {
    return 'abc' + this.num
  }

  destructor() {
    return this.num
  }
}

class UUID {
  constructor(string) {
    this.string = string
  }

  getID() {
    return this.string
  }

  destructor() {
    return this.string
  }
}

ison.addTypes({
  ExamplePerson,
  UUID
})

tap.test('array destructor', function (childTest) {
  let p1 = new ExamplePerson(128)
  let string = ison.stringify(p1)
  let p2 = ison.parse(string)
  
  childTest.strictSame(p1, p2, 'stringify-parse yields same object')
  childTest.ok(p2 instanceof ExamplePerson, 'correct class is instantiated')
  childTest.strictSame(p1.getNametag(), p2.getNametag(), 'correct class is instantiated')
  
  childTest.end()
})

tap.test('object destructor', function (childTest) {
  let p1 = new UUID('B220F0CF-69AD-48C4-A3D9-721B9770B53D')
  let string = ison.stringify(p1)
  let p2 = ison.parse(string)

  childTest.strictSame(p1, p2, 'stringify-parse yields same object')
  childTest.ok(p2 instanceof UUID, 'correct class is instantiated')
  childTest.strictSame(p1.getID(), p2.getID(), 'correct class is instantiated')
  
  childTest.end()
})