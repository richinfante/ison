const ison = require('../parser.js')
const fs = require('fs')

const vectors = {
  large: fs.readFileSync('./tests/vectors/large.json', 'utf8'),
}

let x = ison.parse(vectors.large)
console.log(x.length)