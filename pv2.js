const debug = require('debug')('parser')
const convert_debug = require('debug')('converter')
const cursor_debug = require('debug')('cursor')
const bounds_debug = require('debug')('bounds')


const CTX_OBJECT = 0x01
const CTX_ARRAY = 0x02
const CTX_CONSTRUCTOR = 0x03
const CTX_STRING = 0x04
const { 
  preprocessInt, 
  preprocessString, 
  preprocessFloat, 
  newInstance
} = require('./types.js')

function parseValue(value) {
  value = value.trim()
  convert_debug('PARSE VALUE: ', value)

  if (value == 'null') { 
    return null
  }

  if (value == 'Infinity') { 
    return Infinity
  }

  if (value == 'NaN') { 
    return NaN
  }

  if (value == 'true') { 
    return true
  }

  if (value == 'false') { 
    return false
  }

  if (value[0] == value[value.length-1] && (value[0] == '"' || value[0] == "'")) {
    return preprocessString(value)
  }

  if (/0x[a-f0-9]+/i.test(value)) {
    return parseInt(value.substr(2), 16)
  }

  if (/0o[0-7]+/i.test(value)) {
    return parseInt(value.substr(2), 8)
  }

  if (/0b[01]+/i.test(value)) {
    return parseInt(value.substr(2), 2)
  }

  if (/[+-]?[0-9]+(?:\.[0-9]+)?/.test(value)) {
    return parseFloat(value)
  }

  return value
}

const pairMap = {
  '{': '}',
  '[': ']',
  '(': ')'
}

class Parser {
  constructor(string) {
    this.cur = 0
    this.string = string
    this.contexts = []
  }

  get current() {
    return this.string[this.cur]
  }

  next () {
    cursor_debug(`go from '${this.current}' (${this.cur}) -> '${this.string[this.cur+1]}' (${this.cur+1})`)
    this.cur += 1
    return this.current
  }


  get isWhitespace() {
    return this.current == '\n' || this.current == ' ' || this.current == '\t'
  }

  skip(token) {
    if(this.current == token) {
      this.next()
    } else {
      throw new Error(`expected token "${token}" got "${this.current}"!`)
    }
  }

  skipWhitespace() {
    debug('skip whitespace!')
    while (this.isWhitespace) {
      this.next()
    }
    debug('end skip whitespace!')
  }

  get isSeparator() {
    bounds_debug('isSeparator: ' + (this.isEnter || this.isExit || this.current == ',' || this.current == ':'))
    return this.isEnter || this.isExit || this.current == ',' || this.current == ':'
  }

  get isEnter () {
    bounds_debug('isEnter: ' + (this.current == '{' || this.current == '(' || this.current == '['))
    return this.current == '{' || this.current == '(' || this.current == '['
  }

  get isExit() {
    bounds_debug('isExit: ' + (this.current == '}' || this.current == ')' || this.current == ']'))
    return this.current == '}' || this.current == ')' || this.current == ']'
  }

  get currentContext() {
    let currentContext = this.contexts[this.contexts.length-1]

    if(currentContext == '}') {
      return CTX_OBJECT
    }

    if(currentContext == ')') {
      return CTX_CONSTRUCTOR
    }

    if(currentContext == ']') {
      return CTX_ARRAY
    }

    if(currentContext == '"' || currentContext == '\'') {
      return CTX_STRING
    }
  }

  pushContext() {
    if(this.isEnter) {
      debug(`push context: "${this.current}"`)
      debug(this)
      this.contexts.push(pairMap[this.current])
      this.next()
    } else {
      throw new Error('cannot push a context here!')
    }
  }

  enterContext() {
    debug(`entered context with symbol: "${this.current}"`)
    this.skipWhitespace()

    if(this.isEnter) {
      this.pushContext()
    } else {
      debug('non-entrance context, searching for type!')
      let identifier = this.untilSeparator()


      if(this.isExit || this.current == ',') { 
        debug(`exit context, new value`)
        return parseValue(identifier)
      } else if (this.current == '(') {
        let constructorValues = this.enterContext()

        debug(`exit context, new constructor`)
        return newInstance(identifier.trim(), constructorValues)
      } else {
        throw new Error(`Unexpected Context Enter ${this.current}`)
      }
    }

    this.skipWhitespace()

    debug('enter context ' + this.currentContext)
    if (this.currentContext == CTX_OBJECT) {

      let obj = {}
      debug('entered object!')
      debug(this)

      // While we DO NOT have an exit token
      while(!this.isExit) {

        // Skip any whitespace
        this.skipWhitespace()

        // Find until next separator
        let key = this.untilSeparator()

        // Skip the ':' token
        this.skip(':')

        // Skip whitespace
        this.skipWhitespace()
        
        // Enter a new context, get the value.
        let value = this.enterContext()

        // parse the key value
        key = parseValue(key.trim())

        // Save
        obj[key] = value

        // If it's not an exit, skip.
        if(!this.isExit) {
          this.skipWhitespace()
          this.skip(',')
        }
      }
      
      debug('exit object!')
      this.exitContext()

      return obj
    } else if(this.currentContext == CTX_ARRAY || this.currentContext == CTX_CONSTRUCTOR) {

      let obj = []
      debug('entered array!')
      debug(this)

      // Comma separated list.
      while(!this.isExit) {
        // Skip whitespace
        this.skipWhitespace()

        // Enter a new context
        let value = this.enterContext()
        
        // Push the value
        obj.push(value)

        // Skip commas
        if(!this.isExit) {
          this.skip(',')
        }
      }
      
      debug('exit array!')
      this.exitContext()

      return obj
    }
  }

  exitContext() {
    if(this.isExit) {
      debug(this)
      debug('exit context ' + this.currentContext)
      let out = this.contexts.pop()
      if(out != this.current) {
        throw new Error(`Error! Mismatched context @ ${this.cur}! (expected: "${out}", found: "${this.current}")`)
      }


      this.next()
      this.skipWhitespace()

      debug(`new context is` + this.contexts)

    } else {
      throw new Error('tried to exit a context that was not finished!')
    }
  }

  untilSeparator() {
    let old = this.cur

    while (!this.isSeparator) {
      this.next()
    }

    // this.next()

    debug('parser separator range is ' + old + ' -> ' +  this.cur)

    return this.string.substring(old, this.cur)
  }
}


function parse(string) {
  let p = new Parser(string)
  return p.enterContext()
}

// console.log(parse(`Object({a: 1, b: 2})`))

const { stringify } = require('./')

module.exports = { parse, stringify }