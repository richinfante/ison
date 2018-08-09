/** 
 * PV3 Experimental ISON Parser
 * This is designed to be ported into other languages, such as rust.
 * It will run faster there.
 *
 *
 * This parser is cursor based.
 * We have a finite set of tokens we should encounter at a specific index.
 * We can then use those to determine what to do next.
 * 
 * For in-console debugging, set DEBUG env variable
 * For in-browser debugging, set DEBUG variable to true.
 */


(function() {

  /* debug-block */

  // this is removed when minifying, since minifying removes debugging support.
  // since debug is the only dependency, this shim is not needed, nor is the debug object.
  // 
  if (typeof require == "undefined") {
    require = function(mod) {
      if(mod == 'debug') {
        return function(name) {
          return function(...args) {
            if(typeof DEBUG !="undefined" && DEBUG) console.log(name, ...args)
          }
        }
      }
    }
  }

  const debug = {
    log: require('debug')('parser:log'),
    array: require('debug')('parser:array'),
    object: require('debug')('parser:object'),
    skip: require('debug')('parser:skip'),
    string: require('debug')('parser:string'),
    types: require('debug')('parser:types')
  }

  /* end-debug-block */
  
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
  if (typeof Map != "undefined") {
    types['Map'] = Map
  }

  // Detect Set support
  if (typeof Set != "undefined") {
    types['Set'] = Set
  }

  // Detect RegExp support
  if (typeof RegExp != "undefined") {
    types['RegExp'] = RegExp
  }

  // Detect if buffer.from is available.
  if (typeof Buffer != "undefined") {
    // If it is, check if Buffer.from() is supported.
    if (typeof Buffer.from === "function") {
      funcs['Buffer'] = Buffer.from
    } else {
      // Fallback to constructor.
      types['Buffer'] = Buffer
    }
  }


  function newInstance(name, args) {
    debug.types('newInstance', name, args)

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


  class Parser {
    constructor(string) {
      this.cur = 0
      this.string = string
      this.stored = ''
    }

    /**
     * Convert an identifier into a primitive value.
     * @param  {string} value a string representing some predefined value.
     * @return {Any}       the represented value
     * @throws {Error} If the value is not found.
     */
    fromIdentifier(value) {

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

      this.printError(`Unknown Identifier: "${value}"`)
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
          return this.fromIdentifier(identifier)
        }
      } else {
        this.printError(`Unexpected token "${this.current}" (${this.current.charCodeAt(0)})`)
      }
    }

    /**
     * Check if the current character is a token
     * @param  {RegExp|string}  token a token description
     * @return {Boolean}       does it match the current?
     */
    is(token) {
      if(token instanceof RegExp) {
        return token.test(this.current)
      } else {
        return this.current == token
      }
    }

    /**
     * Get the character under the cursor
     * @return {string} the character
     */
    get current() {
      return this.string[this.cur]
    }

    /**
     * Advance the cursor and get the next value
     * @throws {Error} If we need a next character and we found EOF.
     * @return {string} the next character
     */
    next () {
      this.cur += 1
      if (this.cur > this.string.length) {
        this.printError('Unexpected EOF!')
      }
      return this.current
    }

    /**
     * Returns the next character in the input string.
     * @return {string} next input character
     */
    peek() {
      return this.string[this.cur + 1]
    }


    /**
     * Seek forward in the input for a specific token
     * @param  {RegExp|string} token token to find.
     */
    seek (token) {
      while(!this.is(token)) {
        this.next()
        debug.skip('(seek) skipping', this.current)
      }
    }

    /**
     * Skip matching tokens.
     * @param  {RegExp|String}  token  token to skip
     * @param  {Boolean} strict should we fail if this cannot be found?
     * @param  {Number}  count  skip a certain amount of tokens.
     */
    skip(token, strict=false, count=Infinity) {
      debug.skip('skipping', token)
      let old = this.cur

      // If we're in strict mode, fail immediately.
      if (strict && !this.is(token)) {
        this.printError(`expected token "${token}" got "${this.current}"!`)
      }

      // While it matches, continue.
      while(this.is(token) && count > 0) {
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

    /**
     * Throw an error, internal use function.
     * throws an error with source printout, error description.
     * @throws {Error} If true
     * @param  {String} error error description
     */
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

      throw new Error(`Could not parse input.
${this.string.substring(l_bound, u_bound).replace(/\n/g, ' ')}
${'^'.padStart(count + 1)}
${error}
at input: ${this.cur}`)
    }
  }

  /**
   * Stringify a key.
   * This may add quotes if it does not conform to bare key requirements.
   * 
   * @param  {string} key the object key
   * @return {string}     string representing the key.
   */
  function stringifyKey(key) {
    if(/^[a-zA-Z_][_a-zA-Z0-9]*$/.test(key)) {
      return key
    } else {
      return stringify(key)
    }
  }


  /**
   * Stringify an object, recursively
   * @param  {object} object to stringify
   * @return {string}        string representation
   */
  function stringify(object) {
    if (object instanceof Date) {
      // Serialize dates
      return `Date(${object.getTime()})`
    } else if (typeof object == 'string' || object instanceof String) {
      // Place into double quoted (escaped) strings
      return `"${object.replace(/"/g, '\\"')}"`
    } else if (object instanceof Array) {
      // Join the stringification of children
      return `[${object.map(stringify).join(',')}]`
    } else if(object.constructor.name == 'Set') {
      return `Set(${stringify(Array.from(object))})`
    } else if(object.constructor.name == 'Map') {
      return `Map(${stringify(Array.from(object.entries()))})`
    } else if (typeof Buffer != "undefined" && object instanceof Buffer) {
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
          return `${stringifyKey(item[0])}:${stringify(item[1])}`
        }).join(',')}}`
      } else {
        return `${name}({${Object.entries(object).map((item) => {
          return `${stringifyKey(item[0])}:${stringify(item[1])}`
        }).join(',')}})`
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

  /**
   * Parse a string using the parser.
   * @param  {ison string} string ison formatted string representing data.
   * @throws {Error} If the data is incorrectly formatted.
   * @return {Any}        the represented data
   */
  function parse(string) {
    let p = new Parser(string)
    let result = p.parseNext()
    return result
  }

  // Module shim.
  // Export depending on environment
  var exported_funcs = { parse, stringify }

  if(typeof module != "undefined") {
    module.exports = exported_funcs
  } else if (typeof window != "undefined") {
    window['ISON'] = exported_funcs
  }

})();