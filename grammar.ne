@{%

const moo = require("moo");

const lexer = moo.compile({
  WS:      /[ \t]+/,
  comment: /\/\/.*?$/,
  hex: /0x[a-fA-F0-9]+/,
  oct: /0o[0-7]+/,
  bin: /0b[01]+/,
  identifier: /[a-zA-Z_][a-zA-Z0-9_]*/,
  number:  /[+-]?\d+(?:\.\d+)?/,
  string:  /"(?:\\["\\]|[^\n"\\])*?"|'(?:\\['\\]|[^\n'\\])*?'/,
  separator: ':',
  comma: ',',
  brackets: /[\{\}\[\]\(\)]/,
  NL:      { match: /\n/, lineBreaks: true },
});

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

%}

@lexer lexer

# https://omrelli.ug/nearley-playground/
MAIN -> _ VALUE _                           {% d => d[1] %}

BIN -> [01]:+                            {% d => d[0].join("") %}
HEX -> [0-9A-Fa-f]:+                        {% d => d[0].join("") %}
OCT -> [0-7]:+                            {% d => d[0].join("") %}

# PRIMITIVE NUMBERS
BOOLEAN -> "true" | "false"                 {% d => d[0] == "true" ? true : false  %}
NULL -> "null"                              {% d => null %}
NAN -> "NaN"                                {% d => NaN %}

HEXNUM -> %hex                              {% d => preprocessInt(d[0].value.substr(2), 16) %}
OCTNUM -> %oct                              {% d => preprocessInt(d[0].value.substr(2), 8) %}
BINNUM -> %bin                              {% d => preprocessInt(d[0].value.substr(2), 2) %}
DECNUM -> %number                           {% d => preprocessFloat(d[0].value) %}

# STRINGS
STRING -> %string                           {% d => preprocessString(d[0].value) %}

# KEY VALUE SEPARATED LIST
KEYVALUE -> %identifier _ ":" _ VALUE       {% d => [ d[0].value, d[4] ] %}
          | %string _ ":" _ VALUE           {% d => [ preprocessString(d[0].value), d[4] ] %}

# COMMA SEPARATED KEY VALUE LIST
CSKEYVALUE -> KEYVALUE _ "," _ CSKEYVALUE   {% d => [ d[0], ...d[4] ] %}  
      | KEYVALUE                            {% d => [ d[0] ] %} 
      
# COMMA SEPARATED VALUES LIST    
CSVALUE -> VALUE _ "," _ CSVALUE            {% d => [ d[0], ...d[4] ] %} 
       | VALUE                              {% d => [ d[0] ] %}  
      
# DICTIONARIES SUPPORT    
DICT -> "{" _ CSKEYVALUE _ "}"              {% d => d[2].reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {}) %} 
DICT -> "{" _ "}"                           {% d => { return {} } %}  

# ARRAY
ARRAY -> "[" _ CSVALUE _ "]"                {% d => d[2] %}
ARRAY -> "[" _ "]"                          {% d => { return [] } %}  


# VALUE
VALUE -> 
     STRING                                 {% d => { return d[0] } %}
    | DICT                                  {% d => { return d[0] } %}
    | ARRAY                                 {% d => { return d[0] } %}
    | CONS                                  {% d => { return d[0] } %}
    | BOOLEAN                               {% d => { return d[0] } %}
    | NULL                                  {% d => { return d[0] } %}
    | NAN                                   {% d => { return d[0] } %}
    | BINNUM                                {% d => { return d[0] } %}
    | HEXNUM                                {% d => { return d[0] } %}
    | OCTNUM                                {% d => { return d[0] } %}
    | DECNUM                                {% d => { return d[0] } %}
CONS -> %identifier _ "(" _ ")"             {% d => { return newInstance(d[0].value, []) } %}
CONS -> %identifier _ "(" _ CSVALUE _ ")"   {% d => { return newInstance(d[0].value, d[4]) } %}


_ -> [\s]:*     {% function(d) {return null } %}