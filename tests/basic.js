const tap = require('tap')
const nuon = require('../index.js')

tap.test('objects', function (childTest) {
  const obj = { a: -1, b: { c: 2 }}
  let input = nuon.parse(`{ a: -1, b: { c: 2 }}`)
  let input2 = nuon.parse(`Object({ a: -1, b: { c: 2 }})`)
  let input3 = nuon.parse(nuon.stringify(obj))

  childTest.strictSame(input, obj, 'parsing works')
  childTest.strictSame(input2, obj, 'parsing works with constructors')
  childTest.strictSame(input3, obj, 'stringify-parse loop yields same object')
  childTest.end()
})

tap.test('Bases', function (childTest) {
  let input = nuon.parse(`{ a: 0xF, b: 0b1, c: 0o8, d: 10 }`)

  childTest.strictSame(input.a, 0xF)
  childTest.strictSame(input.b, 0b1),
  childTest.strictSame(input.c, 8),
  childTest.strictSame(input.d, 10)
  childTest.end()
})

tap.test('null', function (childTest) {
  let input = nuon.parse(`{ a: null }`)

  childTest.strictSame(input.a, null)
  childTest.end()
})

tap.test('NaN', function (childTest) {
  const obj = { a: NaN, b: 2}
  let input3 = nuon.parse(nuon.stringify(obj))

  childTest.ok(isNaN(obj.a), 'check NaN is present')
  childTest.strictSame(input3, obj, 'stringify-parse loop yields same object')
  childTest.end()
})


tap.test('arrays', function (childTest) {
  const input = [ 1, 2, new Date(), { a: 1, b: 2 }, Object({ e: 1, f: 2 }), [[1], 2], 3]

  let looped = nuon.parse(nuon.stringify(input))

  childTest.strictSame(input, looped, 'stringify-parse loop yields same object')
  childTest.end()
})



// Test date serialization
tap.test('dates', function (childTest) {
  let date = new Date()
  let date2 = nuon.parse(nuon.stringify(date))

  childTest.strictSame(date, date2, 'stringify-parse yields same date')
  childTest.strictSame(date.getTime(), date2.getTime(), 'date timestamps are equal')
  
  childTest.end()
})


tap.test('buffers', function (childTest) {
  let input = nuon.parse(`{
    data: Buffer('deadbeef', 'hex')
  }`)

  childTest.strictSame(input.data, new Buffer('deadbeef', 'hex'))

  childTest.end()
})


tap.test('sets', function (childTest) {
  let set = nuon.parse(`Set([
    1, 2, 3, 2, 2, 3
  ])`)

  let res = nuon.parse(nuon.stringify(new Set([1,2,3])))

  childTest.strictSame(set.size, 3, 'set length is 3')
  childTest.strictSame(set, new Set([1, 2, 3]), 'sets are equal')
  childTest.strictSame(res.size, 3, 'stringify-parse set length is 3')
  childTest.strictSame(res, new Set([1, 2, 3]), 'stringify-parse  sets are equal')

  childTest.end()
})

tap.test('maps', function (childTest) {
  let map = nuon.parse(`Map([
    [ 1, 2 ],
    [ 3, 4 ],
    [ 5, 6 ]
  ])`)

  let res = nuon.parse(nuon.stringify(new Map([
    [ 1, 2 ],
    [ 3, 4 ],
    [ 5, 6 ]
  ])))

  childTest.strictSame(res, map, 'maps are equal')
  childTest.ok(res.has(1), 'has value')
  childTest.ok(res.has(3), 'has value')
  childTest.ok(res.has(5), 'has value')
  childTest.end()
})