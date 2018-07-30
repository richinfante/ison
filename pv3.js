const debug = {
  log: require('debug')('parser:log'),
  array: require('debug')('parser:array'),
  object: require('debug')('parser:object'),
  skip: require('debug')('parser:skip')
}

const { 
  preprocessInt, 
  preprocessString, 
  preprocessFloat, 
  newInstance
} = require('./types.js')

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
const TOKEN_RPAREN   = ')'
const TOKEN_SQUOTE   = `'`
const TOKEN_DQUOTE   = `"`
const TOKEN_COMMA    = `,`
const TOKEN_COLON    = ':'
const TOKEN_WS       = /[ \n\t]/

const TOKEN_IDENTIFIER = /[a-z0-9_]/i
const TOKEN_IDENTIFIER_START = /[a-z_]/i

const TOKEN_NUMBER_START = /[+0-9\-]/
const TOKEN_NUMBER = /[0-9xbo\.+\-a-f]/i

function fromIdentifier(value) {

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

  throw new Error('Unknown Identifier' + string)
}

function parse(string) {
  let p = new Parser(string)
  let result = p.parseNext()
  debug.log('result', result)
  return result
}

class Parser {
  constructor(string) {
    this.cur = 0
    this.string = string
    this.stored = ''
  }

  /**
   * Parse an identifier.
   * @return {[type]} an identifier string.
   */
  parseIdentifier() {
    this.skip(TOKEN_WS)

    let identifier = ''

    if (this.is(TOKEN_IDENTIFIER_START)) {
      while (this.is(TOKEN_IDENTIFIER)) {
        identifier += this.current
        this.next()
      }
    } else {
      this.printError(`Unexpected token character ${this.current} (${this.current.charCodeAt(0)})`)
    }

    return identifier
  }

  parseNumber() {
    this.skip(TOKEN_WS)

    let num = ''
    if (this.is(TOKEN_NUMBER_START)) {
      while (this.is(TOKEN_NUMBER)) {
        num += this.current
        this.next()
      }
    } else {
      this.printError(`Unexpected token character ${this.current} (${this.current.charCodeAt(0)})`)
    } 

    return parseFloat(num)
  }

  parseString() {
    return '<nyi>'
  }

  parseArguments() {
    this.skip(TOKEN_LPAREN, true, 1)
    this.skip(TOKEN_WS)

    let array = []
    while(!this.is(TOKEN_RPAREN)) {

      this.skip(TOKEN_WS)

      let value = this.parseNext()

      array.push(value)

      this.skip(TOKEN_WS)

      // Comma or RBRACE are exit conditions.
      if (this.is(TOKEN_COMMA)) {
        this.skip(TOKEN_COMMA, true, 1)
      } else if (this.is(TOKEN_RPAREN)) {
        break
      } else {
        this.printError(`Unexpected token, "${this.current}" (${this.current.charCodeAt(0)}) looking for COMMA or RBRACKET.`)
      }
    }

    this.skip(TOKEN_WS)
    this.skip(TOKEN_RPAREN, true, 1)

    return array
  }

  /**
   * Parse an array.
   * @return {[type]} [description]
   */
  parseArray() {
    this.skip(TOKEN_LBRACKET, true, 1)
    this.skip(TOKEN_WS)

    let array = []
    while(!this.is(TOKEN_RBRACKET)) {

      this.skip(TOKEN_WS)

      let value = this.parseNext()

      array.push(value)

      this.skip(TOKEN_WS)

      // Comma or RBRACE are exit conditions.
      if (this.is(TOKEN_COMMA)) {
        this.skip(TOKEN_COMMA, true, 1)
      } else if (this.is(TOKEN_RBRACKET)) {
        break
      } else {
        this.printError(`Unexpected token, "${this.current}" (${this.current.charCodeAt(0)}) looking for COMMA or RBRACKET.`)
      }
    }

    this.skip(TOKEN_WS)
    this.skip(TOKEN_RBRACKET, true, 1)

    return array
  }

  /**
   * Parse an object notation block.
   * @return {[type]} [description]
   */
  parseObject() {

    debug.object('entering object.')

    this.skip(TOKEN_LBRACE, true, 1)
    this.skip(TOKEN_WS)

    let object = {}

    while(!this.is(TOKEN_RBRACE)) {
      let key = null

      debug.object('parsing key')
      // Allowing quoted keys, use quote opt. to figure out which.
      if (this.is(TOKEN_SQUOTE) || this.is(TOKEN_DQUOTE)) {
        key = this.parseString()
      } else {
        key = this.parseIdentifier()
      }

      // Skip separator and WS
      this.skip(TOKEN_WS)
      this.skip(TOKEN_COLON, true, 1)
      this.skip(TOKEN_WS)

      debug.object('got key', key)

      // Value can be anything, go next.
      let value = this.parseNext()

      debug.object('got value', value)

      // Save the key
      object[key] = value


      this.skip(TOKEN_WS)

      // Comma or RBRACE are exit conditions.
      if (this.is(TOKEN_COMMA)) {
        this.skip(TOKEN_COMMA, true, 1)
      } else if (this.is(TOKEN_RBRACE)) {
        break
      } else {
        this.printError(`Unexpected token "${this.current}" (${this.current.charCodeAt(0)}), looking for COMMA or RBRACE.`)
      }
    }

    this.skip(TOKEN_RBRACE, true, 1)

    return object
  }

  /**
   * Parse the next item.
   * This is used to parse a value of any type 
   * @return {[type]} [description]
   */
  parseNext() {
    debug.log('parse next!')
    this.skip(TOKEN_WS)

    if (this.is(TOKEN_LBRACE)) {
      return this.parseObject()
    } else if (this.is(TOKEN_LBRACKET)) {
      return this.parseArray()
    } else if (this.is(TOKEN_LPAREN)) {
      return this.parseArguments()
    } else if (this.is(TOKEN_NUMBER_START)) {
      return this.parseNumber()
    } else {
      let identifier = this.parseIdentifier()

      if(this.is(TOKEN_LPAREN)) {
        let args = this.parseArguments()
        return newInstance(identifier, args)
      } else {
        return fromIdentifier(identifier)
      }
    }
  }

  is(token) {
    let ret = false

    if(token instanceof RegExp) {
      ret = token.test(this.current)
    } else {
      ret = this.current == token
    }

    debug.log('check is', this.current, token, ret)
    
    return ret
  }

  get current() {
    return this.string[this.cur]
  }


  printError(error='Unknown Error') {
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
    
    throw new Error(error)
  }

  next () {
    this.cur += 1
    return this.current
  }

  clear() {
    this.stored = ''
  }

  getParsed() {
    return this.stored
  }

  // SKIP any number of tokens.
  skip(token, strict=false, count=Infinity) {
    debug.skip('skipping', token)
    let old = this.cur

    if(token instanceof RegExp) {
      if(strict && token.test(this.current)) {
        this.printError(`expected token "${token}" got "${this.current}"!`)
      }

      while(token.test(this.current) && count > 0) {
        this.cur += 1
        count -= 1
      }
    } else {
      if(strict && this.current != token) {
        this.printError(`expected token "${token}" got "${this.current}"!`)
      }

      while(this.current == token && count > 0) {
        this.cur += 1
        count -= 1
      }
    }

    debug.skip('skipped ahead', this.cur - old)
  }
}


const { stringify } = require('./')

module.exports = { parse, stringify }