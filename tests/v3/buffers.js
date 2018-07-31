const tap = require('tap')
const nuon = require('../../pv3.js')

tap.test('buffers', function (childTest) {
  let input = nuon.parse(`{
    data: Buffer('deadbeef', 'hex')
  }`)

  childTest.strictSame(input.data, Buffer.from('deadbeef', 'hex'))

  childTest.end()
})

tap.test('buffers', function(childTest) {
  let obj = { created: new Date(), author: 'rich', content: Buffer.from('hello, world', 'ascii')}
  let x = nuon.stringify(obj)
  let y = nuon.parse(x)

  childTest.strictSame(y, obj)
  childTest.end()
})