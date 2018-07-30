const tap = require('tap')
const nuon = require('../../pv2.js')

// Test date serialization
tap.test('dates', function (childTest) {
  let date = new Date()
  let date2 = nuon.parse(nuon.stringify(date))

  childTest.strictSame(date, date2, 'stringify-parse yields same date')
  childTest.strictSame(date.getTime(), date2.getTime(), 'date timestamps are equal')
  
  childTest.end()
})
