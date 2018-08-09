const SOURCE_MODULE = process.env.PARSER_FILE || '../../parser.js'

const tap = require('tap')
const ison = require(SOURCE_MODULE)
const path = require('path')
const fs = require("fs")


tap.test('module', function (childTest) {
  const stats = fs.statSync(path.join(__dirname, SOURCE_MODULE))
  const fileSizeInBytes = stats.size
  
  // Print output of module sources.
  console.log(`test module: ${SOURCE_MODULE}`)
  console.log(`test module size: ${fileSizeInBytes/1000}kb`)

  childTest.end()
})