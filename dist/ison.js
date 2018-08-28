/*!
 * ISON v0.0.16
 * (c) 2018 Rich Infante
 * Released under the MIT License.
 */

(function() {

  

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
  const TOKEN_IDENTIFIER = /[a-z0-9_\.]/i
  const TOKEN_IDENTIFIER_START = /[a-z_]/i
  const TOKEN_NUMBER_START = /[+0-9\-]/
  const TOKEN_NUMBER = /[0-9xbo\.+\-a-f]/i
  const TOKEN_ESCAPE = '\\'
  const TOKEN_NEWLINE = '\n'
  const TOKEN_LINE_COMMENT = '//'
  const TOKEN_BLOCK_COMMENT_START = '/*'
  const TOKEN_BLOCK_COMMENT_END = '*/'

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

  /**
   * Add types to the ISON parser.
   * It will instantiate using them
   * @param {object} object dictionary of object names and constructors.
   */
  function addTypes(object) {
    for(let i in object) {
      types[i] = object[i]
    }
  }

  addConstants({
    'null': null,
    'Infinity': Infinity,
    'true': true,
    'false': false,
    'NaN': NaN
  })

  /**
   * Remove types from the ISON parser.
   * It will remove them from the type index.
   * @param {object} object dictionary of object names and constructors to remove..
   */
  function removeTypes(object) {
    for (let i in object) {
      if(types[i] === object[i]) {
        delete types[i]
      }
    }
  }

    /**
   * Add types to the ISON parser.
   * It will instantiate using them
   * @param {object} object dictionary of object names and constructors.
   */
  function addConstants(object) {
    for(let i in object) {
      funcs[i] = object[i]
    }
  }

  /**
   * Remove types from the ISON parser.
   * It will remove them from the type index.
   * @param {object} object dictionary of object names and constructors to remove..
   */
  function removeConstants(object) {
    for (let i in object) {
      if(funcs[i] === object[i]) {
        delete funcs[i]
      }
    }
  }

  /**
   * Parse a string using the parser.
   * @param  {ison string} string ison formatted string representing data.
   * @throws {Error} If the data is incorrectly formatted.
   * @return {Any}        the represented data
   */
  function parse(string) {
    var cur = 0


    function newInstance(name, args) {

      // Create a new instance using a constructor
      if (types[name]) {
        return new types[name](...args)
      }
      
      // Create a new instance using functions
      if (funcs[name] && typeof funcs[name] == 'function') {
        return funcs[name](...args)
      }
      
      printError(`Unknown type name: "${name}".`)
    }

    /**
     * Convert an identifier into a primitive value.
     * @param  {string} value a string representing some predefined value.
     * @return {Any}       the represented value
     * @throws {Error} If the value is not found.
     */
    function fromIdentifier(value) {

      if (funcs[value] !== undefined) {
        return funcs[value]
      }

      printError(`Unknown Identifier: "${value}"`)
    }

    /**
     * Parse an identifier.
     * @return {[type]} an identifier string.
     */
    function parseIdentifier() {
      skip(TOKEN_WS)

      let identifier = ''

      if (is(TOKEN_IDENTIFIER_START)) {
        while (is(TOKEN_IDENTIFIER)) {
          identifier += current()
          next(false)
        }
      } else {
        printFoundExpectedError(current(), TOKEN_IDENTIFIER_START)
      }

      return identifier
    }

    /**
     * Parse an identifier. These should be valid JS object keys.
     * @return {number} The number that was parsed.
     */
    function parseNumber() {
      skip(TOKEN_WS)

      let num = ''
      if (is(TOKEN_NUMBER_START)) {
        while (is(TOKEN_NUMBER)) {
          num += current()
          next()
        }

        if(num == '-' || num == '+' && is(TOKEN_IDENTIFIER_START)) {
          return (num == '-' ? -1 : 1) * parseIdentifier()
        }

      } else {
        printFoundExpectedError(current(), TOKEN_NUMBER_START)
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
    function parseString() {
      if(!is(TOKEN_STRING_START)) {
        printFoundExpectedError(current(), TOKEN_STRING_START)
      }
      
      let start = current()
      skip(TOKEN_STRING_START, true, 1)
      let out = ''
      
      while(true) {
        if(is(TOKEN_ESCAPE)) {
          let nextChar = next()
          if (nextChar == 'n') {
            out += '\n'
          } else {
            out += nextChar
          }
        } else if(is(start)) {
          break
        } else {
          out += current()
        }

        next()
      }

      skip(TOKEN_STRING_START, true, 1)
      return out
    }

    /**
     * Parse an argument list
     * @return {array} an array containing all the arguments.
     */
    function parseArguments() {
      skip(TOKEN_LPAREN, true, 1)
      skip(TOKEN_WS)

      let array = []
      while(!is(TOKEN_RPAREN)) {

        skip(TOKEN_WS)

        let value = parseNext()

        array.push(value)

        skip(TOKEN_WS)

        // Comma or RBRACE are exit conditions.
        if (is(TOKEN_COMMA)) {
          skip(TOKEN_COMMA, true, 1)
        } else if (is(TOKEN_RPAREN)) {
          break
        } else {
          printFoundExpectedError(current(), '," or ")')
        }
      }

      skip(TOKEN_WS)
      skip(TOKEN_RPAREN, true, 1)

      return array
    }

    /**
     * Parse an array.
     * @return {array} returns array items
     */
    function parseArray() {
      skip(TOKEN_LBRACKET, true, 1)
      skip(TOKEN_WS)

      let array = []
      while(!is(TOKEN_RBRACKET)) {

        skip(TOKEN_WS)

        let value = parseNext()

        array.push(value)

        skip(TOKEN_WS)

        // Comma or RBRACE are exit conditions.
        if (is(TOKEN_COMMA)) {
          skip(TOKEN_COMMA, true, 1)
        } else if (is(TOKEN_RBRACKET)) {
          break
        } else {
          printFoundExpectedError(current(), '," or "]')
        }
      }

      skip(TOKEN_WS)
      skip(TOKEN_RBRACKET, true, 1)

      return array
    }

    /**
     * Parse an object notation block.
     * @return {object} The represented object.
     */
    function parseObject() {

      skip(TOKEN_LBRACE, true, 1)
      skip(TOKEN_WS)

      let object = {}

      while(!is(TOKEN_RBRACE)) {
        let key = null

        skip(TOKEN_WS)

        // Allowing quoted keys, use quote opt. to figure out which.
        if (is(TOKEN_STRING_START)) {
          key = parseString()
        } else if (is(TOKEN_NUMBER_START)) {
          key = parseNumber()
        } else {
          key = parseIdentifier()
        }

        // Skip separator and WS
        skip(TOKEN_WS)
        skip(TOKEN_COLON, true, 1)
        skip(TOKEN_WS)

        // Value can be anything, go next.
        let value = parseNext()

        // Save the key
        object[key] = value


        skip(TOKEN_WS)

        // Comma or RBRACE are exit conditions.
        if (is(TOKEN_COMMA)) {
          skip(TOKEN_COMMA, true, 1)
        } else if (is(TOKEN_RBRACE)) {
          break
        } else {
          printFoundExpectedError(current(), '," or "}')
        }
      }

      skip(TOKEN_RBRACE, true, 1);

      return object
    }

    /**
     * Parse the next item.
     * This is used to parse a value of any type 
     * @return {any} The value
     */
    function parseNext() {
      skip(TOKEN_WS)

      if (is(TOKEN_LBRACE)) {
        return parseObject()
      } else if (is(TOKEN_LBRACKET)) {
        return parseArray()
      } else if (is(TOKEN_LPAREN)) {
        return parseArguments()
      } else if (is(TOKEN_NUMBER_START)) {
        return parseNumber()
      } else if (is(TOKEN_STRING_START)) {
        return parseString()
      } else if (is(TOKEN_IDENTIFIER_START)){
        let identifier = parseIdentifier()
        if(is(TOKEN_LPAREN)) {
          let args = parseArguments()
          return newInstance(identifier, args)
        } else {
          return fromIdentifier(identifier)
        }
      } else {
        printFoundExpectedError(current())
      }
    }

    this.parseNext = parseNext

    /**
     * Check if the current character is a token
     * @param  {RegExp|string}  token a token description
     * @return {Boolean}       does it match the current?
     */
    function is(token) {
      if (current() == undefined) {
        return false
      } else if(token instanceof RegExp) {
        return token.test(current())
      } else {
        return current() == token
      }
    }

    /**
     * Get the character under the cursor
     * @return {string} the character
     */
    function current() {
      return string[cur]
    }

    /**
     * Advance the cursor and get the next value
     * @throws {Error} If we need a next character and we found EOF.
     * @return {string} the next character
     */
    function next (strict=true) {
      cur += 1
      if (strict && cur > string.length) {
        printError('Unexpected EOF!')
      }
      return current()
    }

    /**
     * Returns the next character in the input string.
     * @return {string} next input character
     */
    function peek() {
      return string[cur + 1]
    }


    /**
     * Seek forward in the input for a specific token
     * @param  {RegExp|string} token token to find.
     */
    function seek (token) {
      while(!is(token) && current() != undefined) {
        next()
      }
    }

    /**
     * Skip matching tokens.
     * @param  {RegExp|String}  token  token to skip
     * @param  {Boolean} strict should we fail if this cannot be found?
     * @param  {Number}  count  skip a certain amount of tokens.
     */
    function skip(token, strict=false, count=Infinity) {
      let old = cur

      // If we're in strict mode, fail immediately.
      if (strict && !is(token)) {
        printFoundExpectedError(current(), token)
      }

      // While it matches, continue.
      while (is(token) && count > 0) {
        cur += 1
        count -= 1
      }

      // If we're skipping whitespace, 
      // Perform a skip for comments as well, if the token matches.
      if (token == TOKEN_WS) {

        // If we're on a line comment
        if (current() + peek() == TOKEN_LINE_COMMENT) {
          // Seek past it
          seek(TOKEN_NEWLINE)
        }

        // If we're on a block comment
        if (current() + peek() == TOKEN_BLOCK_COMMENT_START) {
          
          while(true && current != undefined) {
            // Seek to the next '*'  
            seek('*')

            // If it makes up a comment end, break.
            if (current() + peek() == TOKEN_BLOCK_COMMENT_END) {
              break
            } else {
              // Otherwise, continue.
              next()
            }
          }

          // Skip past the end comment.
          next()
          next()
        }

        // If it's still whitespace, skip.
        // TOKEN_WS can only handle one comment at a time.
        if (is(TOKEN_WS)) {
          skip(TOKEN_WS)
        }
      }
    }

    function printFoundExpectedError(found, expected) {
      printError(`Unexpected Token. found: "${found}" (${found.charCodeAt(0)}), expected: "${expected}"`)
    }

    /**
     * Throw an error, internal use function.
     * throws an error with source printout, error description.
     * @throws {Error} If true
     * @param  {String} error error description
     */
    function printError(error='Unknown Error') {
      let current = cur
      let l_bound = current - 10
      if(l_bound < 0) {
        l_bound = 0
      }

      let u_bound = current + 10
      if (u_bound >= string.length) {
        u_bound = string.length - 1
      }

      let count = current - l_bound

      throw new Error(`Could not parse input.
${string.substring(l_bound, u_bound).replace(/\n/g, ' ')}
${'^'.padStart(count + 1)}
${error}
at input: ${cur}`)
    }

    return parseNext()
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
    if(object === null || object === undefined) {
      return 'null'
    } else if (object instanceof Date) {
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
      let name = object.className || object['$type'] || object.constructor.name

      delete object['$type']

      // Join key value pairs. Possibly use $type or constructor name
      if (name == 'Object') {
        return `{${Object.entries(object).map((item) => {
          return `${stringifyKey(item[0])}:${stringify(item[1])}`
        }).join(',')}}`
      } else {
        if (typeof object.destructor == 'function') {
          let destructed = object.destructor()
          if(destructed instanceof Array) {
            return `${name}(${destructed.map(stringify).join(',')})`
          } else {
            return `${name}(${stringify(destructed)})`
          }
        } else {
          return `${name}({${Object.entries(object).map((item) => {
            return `${stringifyKey(item[0])}:${stringify(item[1])}`
          }).join(',')}})`
        }
      }
    } else if (isNaN(object)) {
      return 'NaN'
    } else if (typeof object == 'number') {
      // Number
      return `${object}`
    } else {
      for (let [key, value] of Object.entries(funcs)) {
        if (value === object) {
          return key
        }
      }
      
      console.log(object, typeof object)
      throw new Error('Stringify Error!')
    }
  }

  // Module shim.
  var exported_funcs = { parse, stringify, addTypes, removeTypes, addConstants, removeConstants }

  if(typeof module != "undefined") {
    module.exports = exported_funcs
  } else if (typeof window != "undefined") {
    window['ISON'] = exported_funcs
  }

})();