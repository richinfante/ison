const tap = require('tap')
const nuon = require('../../parser.js')
const fs = require('fs')

const vectors = {
  comments: fs.readFileSync('./tests/vectors/comments.nuon', 'utf8'),
}

tap.test('strings', function (childTest) {
  let input = nuon.parse(vectors.comments)
  let so = nuon.stringify(input)
  let output = nuon.parse(so)

  childTest.strictSame(input, output)

  childTest.end()
})

