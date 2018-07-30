const tap = require('tap')
const nuon = require('../../pv3.js')
const fs = require('fs')

const vectors = {
  string: fs.readFileSync('./tests/vectors/escape.nuon', 'utf8'),
}

tap.test('strings', function (childTest) {
  let input = nuon.parse(vectors.string)
  let so = nuon.stringify(input)
  let output = nuon.parse(so)

  childTest.strictSame(input, { 
    a: "abc'd", 
    b: "a,b,c",
    c: `"'a'`,
    d: `a'bcdef`
  })
  
  childTest.strictSame(input, output)

  childTest.end()
})

