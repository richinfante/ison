const nearley = require("nearley");
const grammar = require("./grammar.js");

function parse(string) {
  // Create a Parser object from our grammar.
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

  parser.feed(string);
  if (parser.results.length > 1) {
    console.log(parser.results)
    throw new Error('Ambigous Grammar!')
  }
  return parser.results[0]
}

function stringify(object) {
  if (object instanceof Date) {
    // Serialize dates
    return `Date(${object.getTime()})`
  } else if (typeof object == 'string' || object instanceof String) {
    // Place into double quoted (escaped) strings
    return `"${object.replace(/"/g, '"')}"`
  } else if (object instanceof Array) {
    // Join the stringification of children
    return `[${object.map(stringify).join(', ')}]`
  } else if(object.constructor.name == 'Set') {
    return `Set(${stringify(Array.from(object))})`
  } else if(object.constructor.name == 'Map') {
    return `Map(${stringify(Array.from(object.entries()))})`
  } else if(object instanceof RegExp){
    return `RegExp(${stringify(object.source)}, ${stringify(object.flags)})`
  } else if (typeof object == 'boolean') {
    return `${object}`
  } else if (object instanceof Object) {
    let name = object['$type'] || object.constructor.name

    delete object['$type']

    // Join key value pairs. Possibly use $type or constructor name
    if (name == 'Object') {
      return `{${Object.entries(object).map((item) => {
        return `${item[0]}: ${stringify(item[1])}`
      }).join(', ')}}`
    } else {
      return `${name}({${Object.entries(object).map((item) => {
        return `${item[0]}: ${stringify(item[1])}`
      }).join(', ')}})`
    }
  } else if (isNaN(object)) {
    return 'NaN'
  } else if (typeof object == 'number') {
    // Number
    return `${object}`
  } else {
    console.log(object, typeof object)
    throw new Error('Stringify Error!')
  }
}

function pprint(string) {
  let output = ''
  let level = 0

  for (let i = 0; i < string.length; i++) {
    if (['{', '[', ','].indexOf(string[i]) > -1) {

      output += string[i] + '\n'

      if (['{', '['].indexOf(string[i]) > -1) {
        level += 1;
      }

      for (let c = 0; c < level; c++) {
        output += '    ';
      }

    } else if (['}', ']'].indexOf(string[i]) > -1) {
      level -= 1;
      output += '\n'
      for (let c = 0; c < level; c++) {
        output += '    ';
      }

      output += string[i]
    } else {


      if (string[i] != ' ') {
        output += string[i]
      }

      if (string[i] == ':') {
        output += ' '
      }
    } 
  }

  return output
}

module.exports = { parse, stringify, pprint }

