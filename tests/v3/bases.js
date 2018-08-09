const tap = require('tap')
const ison = require(process.env.PARSER_FILE || '../../parser.js')

tap.test('Bases', function (childTest) {
  let input = ison.parse(`{ a: 0xF, b: 0b1, c: 0o7, d: 10 }`)

  childTest.strictSame(input.a, 0xF, 'check read properly')
  childTest.strictSame(input.b, 0b1, 'check read properly'),
  childTest.strictSame(input.c, 7, 'check read properly')
  childTest.strictSame(input.d, 10, 'check read properly')
  childTest.end()
})