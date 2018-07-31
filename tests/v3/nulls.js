const tap = require('tap')
const nuon = require('../../parser.js')


tap.test('null', function (childTest) {
  let input = nuon.parse(`{ a: null }`)

  childTest.strictSame(input.a, null, 'check is null')
  childTest.end()
})
