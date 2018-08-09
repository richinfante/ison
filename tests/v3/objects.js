const tap = require('tap')
const ison = require(process.env.PARSER_FILE || '../../parser.js')

tap.test('objects', function (childTest) {
  const obj = { a: -1, b: { c: 2 }}
  let input = ison.parse(`{ a: -1, b: { c: 2 }}`)


  let input2 = ison.parse(`Object({ a: -1, b: { c: 2 }})`)
  let input3 = ison.parse(ison.stringify(obj))

  childTest.strictSame(input, obj, 'parsing works')
  childTest.strictSame(input2, obj, 'parsing works with constructors')
  childTest.strictSame(input3, obj, 'stringify-parse loop yields same object')
  childTest.end()
})

tap.test('numkey', function (childTest) {
  const obj = { 2: -1, 3: { c: 2 }}
  let input = ison.parse(`{ 2: -1, 3: { c: 2 }}`)


  let input2 = ison.parse(`Object({ 2: -1, 3: { c: 2 }})`)
  let input3 = ison.parse(ison.stringify(obj))

  childTest.strictSame(input, obj, 'parsing works')
  childTest.strictSame(input2, obj, 'parsing works with constructors')
  childTest.strictSame(input3, obj, 'stringify-parse loop yields same object')
  childTest.end()
})



tap.test('weirdkey', function (childTest) {
  const obj = { 'abc-def*@': 'test' }
  let input = ison.parse(`{ "abc-def*@": 'test' }`)
  let input3 = ison.parse(ison.stringify(obj))

  childTest.strictSame(input, obj, 'parsing works')
  childTest.strictSame(input3, obj, 'stringify-parse loop yields same object')
  childTest.end()
})
