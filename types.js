const types_debug = require('debug')('types')

const types = {
  'Date': Date,
  'Object': Object,
  'Array': Array,
  'Number': Number
}

if (typeof Buffer != undefined) {
  types['Buffer'] = Buffer
}

if (typeof Map != undefined) {
  types['Map'] = Map
}

if (typeof Set != undefined) {
  types['Set'] = Set
}

if (typeof RegExp != undefined) {
  types['RegExp'] = RegExp
}

const funcs = {
  'Int': parseInt,
  'Float': parseFloat,
  'Boolean': el => new Boolean(el.toLowerCase() == 'true')
}

function newInstance(name, args) {
  types_debug('newInstance', name, args)
  if (types[name]) {
    return new types[name](...args)
  }
  
  if (funcs[name]) {
    return funcs[name](...args)
  }
  
  if (typeof args == 'string') {
    let instance = new Object(args)
    instance['$type'] = name

    return instance
  } else {
    let instance = new Object(...args)
    instance['$type'] = name

    return instance
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