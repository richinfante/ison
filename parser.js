/** 
 * PV3 Experimental ISON Parser
 * This is designed to be ported into other languages, such as rust.
 * It will run faster there.
 *
 *
 * This parser is cursor based.
 * We have a finite set of tokens we should encounter at a specific index.
 * We can then use those to determine what to do next.
 */

const debug = {
  log: require('debug')('parser:log'),
  array: require('debug')('parser:array'),
  object: require('debug')('parser:object'),
  skip: require('debug')('parser:skip'),
  string: require('debug')('parser:string'),
}

const { 
  preprocessInt, 
  preprocessString, 
  preprocessFloat, 
  newInstance
} = require('./types.js')

// Tokens
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
const TOKEN_COLON    = /[:=]/
const TOKEN_WS       = /[ \n\t]/
const TOKEN_STRING_START = /["']/
const TOKEN_IDENTIFIER = /[a-z0-9_]/i
const TOKEN_IDENTIFIER_START = /[a-z_]/i
const TOKEN_NUMBER_START = /[+0-9\-]/
const TOKEN_NUMBER = /[0-9xbo\.+\-a-f]/i
const TOKEN_ESCAPE = '\\'
const TOKEN_NEWLINE = '\n'
const TOKEN_LINE_COMMENT = '//'
const TOKEN_BLOCK_COMMENT_START = '/*'
const TOKEN_BLOCK_COMMENT_END = '*/'


// Convert an identifier into a primitive value.
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

  /**
   * Parse an identifier. These should be valid JS object keys.
   * @return {number} The number that was parsed.
   */
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

    if(num.indexOf('0x') == 0) {
      return parseInt(num.substr(2), 16)
    } else if(num.indexOf('0b') == 0) {
      return parseInt(num.substr(2), 2)
    } else if(num.indexOf('0o') == 0) {
      return parseInt(num.substr(2), 8)
    }

    return parseFloat(num)
  }

  /**
   * Parse a string
   * @return {string} the string that was parsed.
   */
  parseString() {
    debug.string('Parsing String.')
    if(!this.is(TOKEN_STRING_START)) {
      this.printError('Invalid String start token')
    }
    
    let start = this.current
    this.skip(TOKEN_STRING_START, true, 1)
    let out = ''


    debug.string(`Entered string with "${start}" (${start.charCodeAt(0)})`)
    
    while(true) {
      debug.string(`Have "${this.current}" (${this.current.charCodeAt(0)})`)
      if(this.is(TOKEN_ESCAPE)) {
        out += this.next()
        debug.string('Got escape for', this.current)
      } else if(this.is(start)) {
        debug.string('End of string')
        break
      } else {
        out += this.current
        debug.string('Append', this.current)
      }

      this.next()
    }

    this.skip(TOKEN_STRING_START, true, 1)

    debug.string(`output: "${out}"`)
    return out
  }

  /**
   * Parse an argument list
   * @return {array} an array containing all the arguments.
   */
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
   * @return {array} returns array items
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
   * @return {object} The represented object.
   */
  parseObject() {

    debug.object('entering object.')

    this.skip(TOKEN_LBRACE, true, 1)
    this.skip(TOKEN_WS)

    let object = {}

    while(!this.is(TOKEN_RBRACE)) {
      let key = null

      this.skip(TOKEN_WS)

      debug.object('parsing key')

      // Allowing quoted keys, use quote opt. to figure out which.
      if (this.is(TOKEN_STRING_START)) {
        key = this.parseString()
      } else if (this.is(TOKEN_NUMBER_START)) {
        key = this.parseNumber()
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
   * @return {any} The value
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
    } else if (this.is(TOKEN_STRING_START)) {
      return this.parseString()
    } else if (this.is(TOKEN_IDENTIFIER_START)){
      let identifier = this.parseIdentifier()
      if(this.is(TOKEN_LPAREN)) {
        let args = this.parseArguments()
        return newInstance(identifier, args)
      } else {
        return fromIdentifier(identifier)
      }
    } else {
      this.printError(`Unexpected token "${this.current}" (${this.current.charCodeAt(0)})`)
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
    console.log('^'.padStart(count + 1))
    console.log('index:', this.cur)
    
    throw new Error(error)
  }

  next () {
    this.cur += 1
    if (this.cur > this.string.length) {
      printError('Unexpected EOF!')
    }
    return this.current
  }

  peek() {
    return this.string[this.cur + 1]
  }

  clear() {
    this.stored = ''
  }

  getParsed() {
    return this.stored
  }


  seek (token) {
    while(!this.currentMatches(token)) {
      this.next()
      debug.skip('(seek) skipping', this.current)
    }
  }

  currentMatches(token) {
    if (token instanceof RegExp) {
      return token.test(this.current)
    } else {
      return this.current == token
    }
  }

  // SKIP any number of tokens.
  skip(token, strict=false, count=Infinity) {
    debug.skip('skipping', token)
    let old = this.cur

    // If we're in strict mode, fail immediately.
    if (strict && !this.currentMatches(token)) {
      this.printError(`expected token "${token}" got "${this.current}"!`)
    }

    // While it matches, continue.
    while(this.currentMatches(token) && count > 0) {
      this.cur += 1
      count -= 1
    }

    debug.skip('skipped ahead', this.cur - old)

    // If we're skipping whitespace, 
    // Perform a skip for comments as well, if the token matches.
    if (token == TOKEN_WS) {
      debug.skip('check comment seek')

      // If we're on a line comment
      if (this.current + this.peek() == TOKEN_LINE_COMMENT) {
        // Seek past it
        this.seek(TOKEN_NEWLINE)
      }

      // If we're on a block comment
      if (this.current + this.peek() == TOKEN_BLOCK_COMMENT_START) {
        
        while(true) {
          // Seek to the next '*'  
          this.seek('*')

          // If it makes up a comment end, break.
          if (this.current + this.peek() == TOKEN_BLOCK_COMMENT_END) {
            break
          } else {
            // Otherwise, continue.
            this.next()
          }
        }

        // Skip past the end comment.
        this.next()
        this.next()
      }

      // If it's still whitespace, skip.
      // TOKEN_WS can only handle one comment at a time.
      if (this.is(TOKEN_WS)) {
        this.skip(TOKEN_WS)
      }
    }
  }
}



function stringify(object) {
  if (object instanceof Date) {
    // Serialize dates
    return `Date(${object.getTime()})`
  } else if (typeof object == 'string' || object instanceof String) {
    // Place into double quoted (escaped) strings
    return `"${object.replace(/"/g, '\\"')}"`
  } else if (object instanceof Array) {
    // Join the stringification of children
    return `[${object.map(stringify).join(', ')}]`
  } else if(object.constructor.name == 'Set') {
    return `Set(${stringify(Array.from(object))})`
  } else if(object.constructor.name == 'Map') {
    return `Map(${stringify(Array.from(object.entries()))})`
  } else if (object instanceof Buffer) {
    return `Buffer([${[...object]}])`
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


function parse(string) {
  let p = new Parser(string)
  let result = p.parseNext()
  return result
}

module.exports = { parse, stringify }