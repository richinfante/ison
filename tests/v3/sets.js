const tap = require('tap')
const ison = require(process.env.PARSER_FILE || '../../parser.js')

tap.test('sets', function (childTest) {
  let set = ison.parse(`Set([
    1, 2, 3, 2, 2, 3
  ])`)

  let res = ison.parse(ison.stringify(new Set([1,2,3])))

  childTest.strictSame(set.size, 3, 'set length is 3')
  childTest.strictSame(set, new Set([1, 2, 3]), 'sets are equal')
  childTest.strictSame(res.size, 3, 'stringify-parse set length is 3')
  childTest.strictSame(res, new Set([1, 2, 3]), 'stringify-parse  sets are equal')

  childTest.end()
})
