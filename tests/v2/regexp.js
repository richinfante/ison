const tap = require('tap')
const nuon = require('../../pv2.js')

tap.test('RegExp', function (childTest) {
  let input = /nuon|json/gi

  let output = nuon.parse(nuon.stringify(input))

  childTest.strictSame(input, output, 'stringify-parse loop recreates regex')
  childTest.end()
})