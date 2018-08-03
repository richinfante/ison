const tap = require('tap')
const ison = require('../../parser.js')
const fs = require('fs')

const vectors = {
  string: fs.readFileSync('./tests/vectors/escape.ison', 'utf8'),
}

tap.test('strings', function (childTest) {
  let input = ison.parse(vectors.string)
  let so = ison.stringify(input)
  let output = ison.parse(so)

  childTest.strictSame(input, { 
    a: "abc'd", 
    b: "a,b,c",
    c: `"'a'`,
    d: `a'bcdef`
  })
  
  childTest.strictSame(input, output)

  childTest.end()
})

