const types_debug = require('debug')('types')

// Type constructors
// Called with "new" to create an instance
const types = {
  'Date': Date,
  'Object': Object,
  'Array': Array,
  'Number': Number
}

// Functions
// Called normally with arguments to create instance.
const funcs = {
  'Int': parseInt,
  'Float': parseFloat,
  'Boolean': el => new Boolean(el.toLowerCase() == 'true')
}

// Detect Map support
if (typeof Map != undefined) {
  types['Map'] = Map
}

// Detect Set support
if (typeof Set != undefined) {
  types['Set'] = Set
}

// Detect RegExp support
if (typeof RegExp != undefined) {
  types['RegExp'] = RegExp
}

// Detect if buffer.from is available.
if (typeof Buffer != undefined) {
  // If it is, check if Buffer.from() is supported.
  if (typeof Buffer.from === "function") {
    funcs['Buffer'] = Buffer.from
  } else {
    // Fallback to constructor.
    types['Buffer'] = Buffer
  }
}


function newInstance(name, args) {
  types_debug('newInstance', name, args)

  // Create a new instance using a constructor
  if (types[name]) {
    return new types[name](...args)
  }
  
  // Create a new instance using functions
  if (funcs[name]) {
    return funcs[name](...args)
  }
  
  
  if (args.length == 1) {
     return args[0]
   } else {
     return args
   }
  
}


function preprocessFloat(str) {
  types_debug('preprocess float', str)
  return parseFloat(str)
}

function preprocessInt(str, radix) {
  types_debug('preprocess int', str)
  return parseInt(str, radix)
}


function preprocessString(str) {
  types_debug('preprocess string', str)
  let output = str.substring(1, str.length - 1)
  return output
}

module.exports = { preprocessFloat, preprocessString, preprocessInt, newInstance }