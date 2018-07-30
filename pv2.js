const debug = require('debug')('parser')
const convert_debug = require('debug')('converter')
const cursor_debug = require('debug')('cursor')
const bounds_debug = require('debug')('bounds')

// Context Types
const CTX_OBJECT = 0x01
const CTX_ARRAY = 0x02
const CTX_CONSTRUCTOR = 0x03
const CTX_STRING = 0x04

const TOKEN_INFINITY = 'Infinity'
const TOKEN_NAN      = 'NaN'
const TOKEN_TRUE     = 'true'
const TOKEN_FALSE    = 'false'
const TOKEN_NULL     = 'null'

const TOKEN_LBRACE   = '{'
const TOKEN_RBRACE   = '}'
const TOKEN_LBRACKET = '['
const TOKEN_RBRACKET = ']'
const TOKEN_LPAREN   = '('
const TOKEN_RPAREN   = '('
const TOKEN_SQUOTE   = `'`
const TOKEN_DQUOTE   = `"`
const TOKEN_COMMA    = `,`
const TOKEN_COLON    = `:`
const TOKEN_WS       = `\n`








const { 
  preprocessInt, 
  preprocessString, 
  preprocessFloat, 
  newInstance
} = require('./types.js')

function parseValue(value) {
  value = value.trim()
  convert_debug('PARSE VALUE: ', value)

  if (value == TOKEN_NULL) { 
    return null
  }

  if (value == TOKEN_INFINITY) { 
    return Infinity
  }

  if (value == TOKEN_NAN) { 
    return NaN
  }

  if (value == TOKEN_TRUE) { 
    return true
  }

  if (value == TOKEN_FALSE) { 
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



class Parser2 {
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
      this.cur += 1
    } else {
      this.printError()
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
    return this.isEnter || this.isExit  || this.isString || this.current == ',' || this.current == ':'
  }

  get isString() {
    return this.current == TOKEN_DQUOTE || this.current == TOKEN_SQUOTE
  }

  get isEnter () {
    return this.current == '{' || this.current == '(' || this.current == '[' || this.isString
  }

  get isExit() {
    if (this.currentContext == CTX_STRING) {
      debug('check for string context, wasEscape=' + this.wasEscape)
      return this.isString && this.currentContextSymbol == this.current
    }

    return this.current == '}' || this.current == ')' || this.current == ']'
  }


  get currentContextSymbol() {
    return this.contexts[this.contexts.length-1]
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

    if(currentContext == `"` || currentContext == `'`) {
      return CTX_STRING
    }
  }

  printError() {
    let current = this.cur
    let l_bound = current - 10
    if(l_bound < 0) {
      l_bound = 0
    }

    let u_bound = current + 10
    if (u_bound >= this.string.length) {
      u_bound = this.string.length - 1
    }

    let count = current - l_bound
    console.log(this.string.substring(l_bound, u_bound).replace(/\n/g, ' '))
    console.log('^'.padStart(count - 1))
  }

  pushContext() {
    if(this.isEnter) {
      debug(`push context: "${this.current}"`)
      debug(this)

      if(pairMap[this.current] != undefined) {
        this.contexts.push(pairMap[this.current])
      } else {
        this.contexts.push(this.current)
      }

      this.next()
    } else {
      this.printError()
      throw new Error('cannot push a context here!')
    }
  }

  // This gets a value from the parser.
  getValue() {
    debug('getValue!')

    // Initially, skip whitespace.
    this.skipWhitespace()

    // If on an enter symbol, enter a new context.
    if(this.isEnter) {
      debug('getValue encountered a new context!')
      return this.enterContext()
    } 

    // Otherwise, extract until the next separator.
    let identifier = this.untilSeparator()

    // If we are on an exit or a comma, parse the value.
    if (this.isExit || this.current == ',' || this.current == ':') { 
      debug(`parseValue`)
      return parseValue(identifier)
    } 

    // If we are entering a new constructor context, enter it and create an instance.
    if (this.current == '(') {

      let constructorValues = this.enterContext()

      debug(`newInstance`)
      return newInstance(identifier.trim(), constructorValues)
    }

    this.printError()
    throw new Error(`Unexpected Context Enter ${this.current}`)
  }

  enterContext() {
    debug(`entered context with symbol: "${this.current}"`)
    if(this.currentContext != CTX_STRING) {
      this.skipWhitespace()

      if(this.isEnter) {
        this.pushContext()
      }
    }

    debug('enter context ' + this.currentContext)

    if (this.currentContext == CTX_OBJECT) {

      debug('entered object!')
      debug(this)

      let obj = {}

      // While we DO NOT have an exit token
      while(!this.isExit) {

        // Skip any whitespace
        this.skipWhitespace()

        // Find until next separator
        let key = this.getValue()

        // Skip the ':' token
        this.skip(':')

        // Skip whitespace
        this.skipWhitespace()
        
        // Enter a new context, get the value.
        let value = this.getValue()

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
      
      debug('entered array!')
      debug(this)

      let obj = []

      // Comma separated list.
      while(!this.isExit) {
        // Skip whitespace
        this.skipWhitespace()

        // Enter a new context
        let value = this.getValue()
        
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
    } else if(this.currentContext == CTX_STRING) {

      debug('entered string!')
      debug(this)

      let string = ''
      let hadEscape = 0

      // Comma separated list.
      while(!this.isExit || hadEscape) {

        // If the current is an escape or is the exiting symbol.
        if (this.current == '\\' || this.current == this.currentContextSymbol) {

          // If last was an escape, add it.
          if(hadEscape) {
            hadEscape = false
            string += this.current
          } else {

            // Otherwise, increase escape count.
            hadEscape = true
          }
        }

        // Skip whitespace
        let x = this.next()
      }
      
      debug('exit string!', string)
      this.exitContext()

      return string
    }
  }

  exitContext() {
    if(this.isExit) {
      debug(this)
      debug('exit context ' + this.currentContext)
      let out = this.contexts.pop()
      if(out != this.current) {
        this.printError()
        throw new Error(`Error! Mismatched context @ ${this.cur}! (expected: "${out}", found: "${this.current}")`)
      }


      this.next()
      this.skipWhitespace()

      debug(`new context is` + this.contexts)

    } else {
      this.printError()
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
      this.printError()
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
    return this.isEnter || this.isExit  || this.isString || this.current == ',' || this.current == ':'
  }

  get isString() {
    return (this.current == `"` || this.current == `'`)
  }

  get isEnter () {
    return this.current == '{' || this.current == '(' || this.current == '[' || this.isString
  }

  get isExit() {
    if (this.currentContext == CTX_STRING) {
      debug('check for string context, wasEscape=' + this.wasEscape)
      return this.isString && this.currentContextSymbol == this.current
    }

    return this.current == '}' || this.current == ')' || this.current == ']'
  }


  get currentContextSymbol() {
    return this.contexts[this.contexts.length-1]
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

    if(currentContext == `"` || currentContext == `'`) {
      return CTX_STRING
    }
  }

  printError() {
    let current = this.cur
    let l_bound = current - 10
    if(l_bound < 0) {
      l_bound = 0
    }

    let u_bound = current + 10
    if (u_bound >= this.string.length) {
      u_bound = this.string.length - 1
    }

    let count = current - l_bound
    console.log(this.string.substring(l_bound, u_bound).replace(/\n/g, ' '))
    console.log('^'.padStart(count - 1))
  }

  pushContext() {
    if(this.isEnter) {
      debug(`push context: "${this.current}"`)
      debug(this)

      if(pairMap[this.current] != undefined) {
        this.contexts.push(pairMap[this.current])
      } else {
        this.contexts.push(this.current)
      }

      this.next()
    } else {
      this.printError()
      throw new Error('cannot push a context here!')
    }
  }

  // This gets a value from the parser.
  getValue() {
    debug('getValue!')

    // Initially, skip whitespace.
    this.skipWhitespace()

    // If on an enter symbol, enter a new context.
    if(this.isEnter) {
      debug('getValue encountered a new context!')
      return this.enterContext()
    } 

    // Otherwise, extract until the next separator.
    let identifier = this.untilSeparator()

    // If we are on an exit or a comma, parse the value.
    if (this.isExit || this.current == ',' || this.current == ':') { 
      debug(`parseValue`)
      return parseValue(identifier)
    } 

    // If we are entering a new constructor context, enter it and create an instance.
    if (this.current == '(') {

      let constructorValues = this.enterContext()

      debug(`newInstance`)
      return newInstance(identifier.trim(), constructorValues)
    }

    this.printError()
    throw new Error(`Unexpected Context Enter ${this.current}`)
  }

  enterContext() {
    debug(`entered context with symbol: "${this.current}"`)
    if(this.currentContext != CTX_STRING) {
      this.skipWhitespace()

      if(this.isEnter) {
        this.pushContext()
      }
    }

    debug('enter context ' + this.currentContext)

    if (this.currentContext == CTX_OBJECT) {

      debug('entered object!')
      debug(this)

      let obj = {}

      // While we DO NOT have an exit token
      while(!this.isExit) {

        // Skip any whitespace
        this.skipWhitespace()

        // Find until next separator
        let key = this.getValue()

        // Skip the ':' token
        this.skip(':')

        // Skip whitespace
        this.skipWhitespace()
        
        // Enter a new context, get the value.
        let value = this.getValue()

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
      
      debug('entered array!')
      debug(this)

      let obj = []

      // Comma separated list.
      while(!this.isExit) {
        // Skip whitespace
        this.skipWhitespace()

        // Enter a new context
        let value = this.getValue()
        
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
    } else if(this.currentContext == CTX_STRING) {

      debug('entered string!')
      debug(this)

      let string = ''
      let hadEscape = 0

      // Comma separated list.
      while(!this.isExit || hadEscape) {

        // If the current is an escape or is the exiting symbol.
        if (this.current == '\\' || this.current == this.currentContextSymbol) {

          // If last was an escape, add it.
          if(hadEscape) {
            hadEscape = false
            string += this.current
          } else {

            // Otherwise, increase escape count.
            hadEscape = true
          }
        }

        // Skip whitespace
        let x = this.next()
      }
      
      debug('exit string!', string)
      this.exitContext()

      return string
    }
  }

  exitContext() {
    if(this.isExit) {
      debug(this)
      debug('exit context ' + this.currentContext)
      let out = this.contexts.pop()
      if(out != this.current) {
        this.printError()
        throw new Error(`Error! Mismatched context @ ${this.cur}! (expected: "${out}", found: "${this.current}")`)
      }


      this.next()
      this.skipWhitespace()

      debug(`new context is` + this.contexts)

    } else {
      this.printError()
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
  let p = new Parser2(string)
  return p.getValue()
}

// console.log(parse(`Object({a: 1, b: 2})`))

const { stringify } = require('./')

module.exports = { parse, stringify }