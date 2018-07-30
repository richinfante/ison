const tap = require('tap')
const nuon = require('../../pv3.js')

tap.test('booleans', function (childTest) {
  let input = nuon.parse(`{ a: false, b: true }`)
  let output = nuon.parse(nuon.stringify(input))

  childTest.notOk(input.a)
  childTest.ok(input.b)
  childTest.strictSame(input, output)

  childTest.end()
})