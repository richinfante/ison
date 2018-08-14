const tap = require('tap')
const ison = require(process.env.PARSER_FILE || '../../parser.js')

class X {
  constructor(obj) {
    this.obj = obj
  }

  get className() {
    return 'Y'
  }

  destructor() {
    return this.obj
  }
}

ison.addTypes({ Y: X })

tap.test('bad-things', function (childTest) {
  let input = ison.parse(`Y({a:2})`)
  let output = ison.stringify(input)
  let res = ison.parse(output)

  childTest.strictSame('Y({a:2})', output, 'output has correct class')
  childTest.strictSame(input, res, 'stringify parse loop yields same object')
  childTest.strictSame(res.obj.a, 2, 'has correct value')
  childTest.ok(res instanceof X, 'is corect instance')
  childTest.end()
})