const tap = require('tap')
const nuon = require('../../pv3.js')

tap.test('arrays', function (childTest) {
  const input = [ 1, 2, new Date(), { a: 1, b: 2 }, Object({ e: 1, f: 2 }), [[1], 2], 3]

  let looped = nuon.parse(nuon.stringify(input))

  childTest.strictSame(input, looped, 'stringify-parse loop yields same object')
  childTest.end()
})