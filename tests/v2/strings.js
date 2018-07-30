const tap = require('tap')
const nuon = require('../../pv2.js')
const fs = require('fs')

const vectors = {
  string: fs.readFileSync('./tests/vectors/escape.nuon', 'utf8'),
}

tap.test('strings', function (childTest) {
  let input = nuon.parse(vectors.string)
  let output = nuon.parse(nuon.stringify(input))

  childTest.strictSame(input, { 
    a: "abc'd", 
    b: "a,b,c",
    c: `"'a'`,
    d: `a'bcdef`
  })
  childTest.strictSame(input, output)

  childTest.end()
})

