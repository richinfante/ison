const tap = require('tap')
const ison = require(process.env.PARSER_FILE || '../../parser.js')

tap.test('Bases', function (childTest) {
  let input = ison.parse(`{ a: 0xF, b: 0b1, c: 0o7, d: 10 }`)

  childTest.strictSame(input.a, 0xF, 'check read properly')
  childTest.strictSame(input.b, 0b1, 'check read properly'),
  childTest.strictSame(input.c, 7, 'check read properly')
  childTest.strictSame(input.d, 10, 'check read properly')
  childTest.end()
})

tap.test('Units', function (childTest) {
  let input = ison.parse(`{ g: 9.88 m/s^2 }`)
  childTest.strictSame(input.g + 0, 9.88, 'Check that both are numbers')
  childTest.strictSame(input.g.units, 'm/s^2', 'Check units')
  let looped = ison.parse(ison.stringify(input))
  childTest.strictSame(looped.g + 0, 9.88, 'looped check that both are numbers')
  childTest.strictSame(looped.g.units, 'm/s^2', 'looped check units')
  childTest.end()
})


tap.test('Units (with μ)', function (childTest) {
  let input = ison.parse(`{ capacitance: 35 μF }`)
  childTest.strictSame(input.capacitance + 0, 35, 'Check that both are numbers')
  childTest.strictSame(input.capacitance.units, 'μF', 'Check units')
  let looped = ison.parse(ison.stringify(input))
  childTest.strictSame(looped.capacitance + 0, 35, 'looped check that both are numbers')
  childTest.strictSame(looped.capacitance.units, 'μF', 'looped check units')
  childTest.end()
})



tap.test('Units (with %)', function (childTest) {
  let input = ison.parse(`{ uptime: 99.999 % }`)
  childTest.strictSame(input.uptime + 0, 99.999, 'Check that both are numbers')
  childTest.strictSame(input.uptime.units, '%', 'Check units')
  let looped = ison.parse(ison.stringify(input))
  childTest.strictSame(looped.uptime + 0, 99.999, 'looped check that both are numbers')
  childTest.strictSame(looped.uptime.units, '%', 'looped check units')
  childTest.end()
})

