const tap = require('tap')
const ison = require(process.env.PARSER_FILE || '../../parser.js')

tap.test('buffers', function (childTest) {
  let input = ison.parse(`{
    data: Buffer('deadbeef', 'hex')
  }`)

  childTest.strictSame(input.data, Buffer.from('deadbeef', 'hex'))

  childTest.end()
})

tap.test('buffers', function(childTest) {
  let obj = { created: new Date(), author: 'rich', content: Buffer.from('hello, world', 'ascii')}
  let x = ison.stringify(obj)
  let y = ison.parse(x)

  childTest.strictSame(y, obj)
  childTest.end()
})