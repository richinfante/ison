const tap = require('tap')
const ison = require('../../parser.js')

tap.test('NaN', function (childTest) {
  const obj = { a: NaN, b: 2}
  let input3 = ison.parse(ison.stringify(obj))

  childTest.ok(isNaN(obj.a), 'check NaN is present')
  childTest.strictSame(input3, obj, 'stringify-parse loop yields same object')
  childTest.end()
})

tap.test('infinity', function (childTest) {
  const obj = { a: Infinity, b: 2}
  let input3 = ison.parse(ison.stringify(obj))

  childTest.notOk(isFinite(obj.a), 'check is not finite')
  childTest.strictSame(input3, obj, 'stringify-parse loop yields same object')
  childTest.end()
})