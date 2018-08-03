const tap = require('tap')
const ison = require('../../parser.js')


tap.test('null', function (childTest) {
  let input = ison.parse(`{ a: null }`)

  childTest.strictSame(input.a, null, 'check is null')
  childTest.end()
})
