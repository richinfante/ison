const tap = require('tap')
const ison = require(process.env.PARSER_FILE || '../../parser.js')
const fs = require('fs')

const vectors = {
  comments: fs.readFileSync('./tests/vectors/comments.ison', 'utf8'),
}

tap.test('strings', function (childTest) {
  let input = ison.parse(vectors.comments)
  let so = ison.stringify(input)
  let output = ison.parse(so)

  childTest.strictSame(input, output)

  childTest.end()
})

