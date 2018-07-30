const tap = require('tap')
const nuon = require('../pv3.js')
const fs = require('fs')

const vectors = {
  large: fs.readFileSync('./tests/vectors/large.json', 'utf8'),
}

vectors.large_obj = nuon.parse(vectors.large)

tap.test('nuon-parse', function (childTest) {
  nuon.parse(vectors.large)
  childTest.end()
})

tap.test('json-parse', function (childTest) {
  JSON.parse(vectors.large)
  childTest.end()
})

tap.test('nuon-stringify', function (childTest) {
  nuon.stringify(vectors.large_obj)
  childTest.end()
})

tap.test('json-stringify', function (childTest) {
  JSON.stringify(vectors.large_obj)
  childTest.end()
})