const tap = require('tap')
const ison = require(process.env.PARSER_FILE || '../../parser.js')

ison.addConstants({
  'RANDOM_FLOAT': Math.random,
  'BEST_NUMBER': 1337
})

tap.test('constants', function (childTest) {
  let input = ison.parse(`{
    func: RANDOM_FLOAT,
    num: BEST_NUMBER
  }`)

  childTest.strictSame(input.func, Math.random, 'correct function should be resurrected')
  childTest.strictSame(input.num, 1337, 'correct number should be resurrected')
  // childTest.strictSame(ison.stringify(Math.random), 'RANDOM_FLOAT', 'should serialize using name')
  childTest.end()
})