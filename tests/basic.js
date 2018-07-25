const tap = require('tap')
const uon = require('../index.js')

tap.test('objects', function (childTest) {
  const obj = { a: -1, b: { c: 2 }}
  let input = uon.parse(`{ a: -1, b: { c: 2 }}`)
  let input2 = uon.parse(`Object({ a: -1, b: { c: 2 }})`)
  let input3 = uon.parse(uon.stringify(obj))

  childTest.strictSame(input, obj, 'parsing works')
  childTest.strictSame(input2, obj, 'parsing works with constructors')
  childTest.strictSame(input3, obj, 'stringify-parse loop yields same object')
  childTest.end()
})

tap.test('arrays', function (childTest) {
  const input = [ 1, 2, new Date(), { a: 1, b: 2 }, Object({ e: 1, f: 2 }), [[1], 2], 3]

  let looped = uon.parse(uon.stringify(input))

  childTest.strictSame(input, looped, 'stringify-parse loop yields same object')
  childTest.end()
})



// Test date serialization
tap.test('dates', function (childTest) {
  let date = new Date()
  let date2 = uon.parse(uon.stringify(date))

  childTest.strictSame(date, date2, 'stringify-parse yields same date')
  childTest.strictSame(date.getTime(), date2.getTime(), 'date timestamps are equal')
  
  childTest.end()
})


tap.test('buffers', function (childTest) {
  let input = uon.parse(`{
    data: Buffer('deadbeef', 'hex'),
    name: String(Buffer('hello, world!', 'ascii'))
  }`)

  childTest.strictSame(input.data, new Buffer('deadbeef', 'hex'))
  childTest.strictSame(input.name, 'hello, world!')

  childTest.end()
})
