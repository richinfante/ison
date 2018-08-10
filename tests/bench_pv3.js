const tap = require('tap')
const ison = require('../dist/ison.js')
const fs = require('fs')

const vectors = {
  large: fs.readFileSync('./tests/vectors/large.json', 'utf8'),
}

vectors.large_obj = ison.parse(vectors.large)

tap.test('ison-parse', function (childTest) {
  ison.parse(vectors.large)
  childTest.end()
})

tap.test('ison.min-parse', function (childTest) {
  ison.parse(vectors.large)
  childTest.end()
})

tap.test('json-parse', function (childTest) {
  JSON.parse(vectors.large)
  childTest.end()
})

tap.test('ison-stringify', function (childTest) {
  ison.stringify(vectors.large_obj)
  childTest.end()
})

tap.test('ison.min-stringify', function (childTest) {
  ison.stringify(vectors.large_obj)
  childTest.end()
})

tap.test('json-stringify', function (childTest) {
  JSON.stringify(vectors.large_obj)
  childTest.end()
})