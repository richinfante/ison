const tap = require('tap')
const ison = require(process.env.PARSER_FILE || '../../parser.js')


tap.test('null', function (childTest) {
  let input = ison.parse(`{ a: null }`)
  let i2 = ison.parse(ison.stringify(input))
  childTest.strictSame(input.a, null, 'check is null')
  childTest.strictSame(input, i2, 'stringify-parse returns same object')
  childTest.end()
})
