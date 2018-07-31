const tap = require('tap')
const nuon = require('../../parser.js')

tap.test('maps', function (childTest) {
  let map = nuon.parse(`Map([
    [ 1, 2 ],
    [ 3, 4 ],
    [ 5, 6 ]
  ])`)

  let res = nuon.parse(nuon.stringify(new Map([
    [ 1, 2 ],
    [ 3, 4 ],
    [ 5, 6 ]
  ])))

  childTest.strictSame(res, map, 'maps are equal')
  childTest.ok(res.has(1), 'has value')
  childTest.ok(res.has(3), 'has value')
  childTest.ok(res.has(5), 'has value')
  childTest.end()
})