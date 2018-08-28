const tap = require('tap')
const ison = require('../../dist/ison.js')
const fs = require('fs')

let items = []

for(let i = 0; i < 1e6; i++) {
  items += Math.random() + 'string!'
}

let vector = JSON.stringify(items)

tap.test('ison-parse 1m strings', function (childTest) {
  ison.parse(vector)
  childTest.end()
})

tap.test('json-parse 1m strings', function (childTest) {
  JSON.parse(vector)
  childTest.end()
})
