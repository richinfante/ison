const tap = require('tap')
const nuon = require('../../pv2.js')

tap.test('buffers', function (childTest) {
  let input = nuon.parse(`{
    data: Buffer('deadbeef', 'hex')
  }`)

  childTest.strictSame(input.data, Buffer.from('deadbeef', 'hex'))

  childTest.end()
})
