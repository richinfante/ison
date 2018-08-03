const tap = require('tap')
const ison = require('../../parser.js')

// Test date serialization
tap.test('dates', function (childTest) {
  let date = new Date()
  let date2 = ison.parse(ison.stringify(date))

  childTest.strictSame(date, date2, 'stringify-parse yields same date')
  childTest.strictSame(date.getTime(), date2.getTime(), 'date timestamps are equal')
  
  childTest.end()
})
