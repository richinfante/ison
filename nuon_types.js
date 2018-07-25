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

const funcs = {
  'Int': parseInt,
  'Float': parseFloat,
  'Bool': el => el.toLowerCase() == 'true'
}

function newInstance(name, args) {
  // console.log('newInstance', name, args)
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
  // console.log('preprocess float', str)
  return parseFloat(str)
}

function preprocessInt(str, radix) {
  // console.log('preprocess int', str)
  return parseInt(str, radix)
}


function preprocessString(str) {
  // console.log('preprocess string', str)
  let output = str.substring(1, str.length - 1)
  return output
}

module.exports = { preprocessFloat, preprocessString, preprocessInt, newInstance }