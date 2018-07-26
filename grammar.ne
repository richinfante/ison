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

const { 
  preprocessInt, 
  preprocessString, 
  preprocessFloat, 
  newInstance 
} = require('./nuon_types.js')

%}

@lexer lexer

# https://omrelli.ug/nearley-playground/
MAIN -> _ VALUE _                           {% d => d[1] %}

BIN -> [01]:+                               {% d => d[0].join("") %}
HEX -> [0-9A-Fa-f]:+                        {% d => d[0].join("") %}
OCT -> [0-7]:+                              {% d => d[0].join("") %}

# PRIMITIVE CONSTANTS
BOOLEAN -> "true" | "false"                 {% d => d[0] == "true" ? true : false  %}
NULL -> "null"                              {% d => null %}
NAN -> "NaN"                                {% d => NaN %}
INFINITY -> "Infinity"                      {% d => Infinity %}

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
VALUE ->  STRING                            {% d => { return d[0] } %}
       | DICT                               {% d => { return d[0] } %}
       | ARRAY                              {% d => { return d[0] } %}
       | CONS                               {% d => { return d[0] } %}
       | BOOLEAN                            {% d => { return d[0] } %}
       | NULL                               {% d => { return d[0] } %}
       | NAN                                {% d => { return d[0] } %}
       | INFINITY                           {% d => { return d[0] } %}
       | BINNUM                             {% d => { return d[0] } %}
       | HEXNUM                             {% d => { return d[0] } %}
       | OCTNUM                             {% d => { return d[0] } %}
       | DECNUM                             {% d => { return d[0] } %}
CONS -> %identifier _ "(" _ ")"             {% d => { return newInstance(d[0].value, []) } %}
CONS -> %identifier _ "(" _ CSVALUE _ ")"   {% d => { return newInstance(d[0].value, d[4]) } %}


_ -> [\s]:*                                 {% function(d) {return null } %}