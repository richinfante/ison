const tap = require('tap')
const ison = require('../../parser.js')

tap.test('booleans', function (childTest) {
  let input = ison.parse(`{ a: false, b: true }`)
  let output = ison.parse(ison.stringify(input))

  childTest.notOk(input.a)
  childTest.ok(input.b)
  childTest.strictSame(input, output)

  childTest.end()
})