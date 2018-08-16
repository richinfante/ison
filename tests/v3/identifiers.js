const tap = require('tap')
const ison = require(process.env.PARSER_FILE || '../../parser.js')

ison.addConstants({
  'org.ison.version': require('../../package.json').version
})
tap.test('constants', function (childTest) {
  childTest.strictSame(ison.parse(`org.ison.version`), require('../../package.json').version, 'dotted identifiers work')
  childTest.strictSame(ison.parse(`Infinity`), Infinity, 'correct identifier should be resurrected')
  childTest.strictSame(ison.parse(`null`), null, 'correct identifier should be resurrected')
  childTest.strictSame(ison.parse(`NaN`), NaN, 'correct identifier should be resurrected')
  childTest.strictSame(ison.parse(`-Infinity`), -Infinity, 'correct identifier should be resurrected')

  childTest.end()
})