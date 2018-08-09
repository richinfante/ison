const tap = require('tap')
const ison = require(process.env.PARSER_FILE || '../../parser.js')

tap.test('RegExp', function (childTest) {
  let input = /ison|json/gi

  let output = ison.parse(ison.stringify(input))

  childTest.strictSame(input, output, 'stringify-parse loop recreates regex')
  childTest.end()
})