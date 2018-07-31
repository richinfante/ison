const tap = require('tap')
const nuon = require('../../parser.js')

tap.test('objects', function (childTest) {
  const obj = { a: -1, b: { c: 2 }}
  let input = nuon.parse(`{ a: -1, b: { c: 2 }}`)


  let input2 = nuon.parse(`Object({ a: -1, b: { c: 2 }})`)
  let input3 = nuon.parse(nuon.stringify(obj))

  childTest.strictSame(input, obj, 'parsing works')
  childTest.strictSame(input2, obj, 'parsing works with constructors')
  childTest.strictSame(input3, obj, 'stringify-parse loop yields same object')
  childTest.end()
})

tap.test('numkey', function (childTest) {
  const obj = { 2: -1, 3: { c: 2 }}
  let input = nuon.parse(`{ 2: -1, 3: { c: 2 }}`)


  let input2 = nuon.parse(`Object({ 2: -1, 3: { c: 2 }})`)
  let input3 = nuon.parse(nuon.stringify(obj))

  childTest.strictSame(input, obj, 'parsing works')
  childTest.strictSame(input2, obj, 'parsing works with constructors')
  childTest.strictSame(input3, obj, 'stringify-parse loop yields same object')
  childTest.end()
})