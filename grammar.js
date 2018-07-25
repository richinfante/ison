// Generated automatically by nearley, version 2.15.0
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }


const moo = require("moo");

const lexer = moo.compile({
  WS:      /[ \t]+/,
  comment: /\/\/.*?$/,
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

if (typeof Symbol != undefined) {
  types['Symbol'] = Symbol
}

if (typeof Map != undefined) {
  types['Map'] = Map
}

const funcs = {
  'Int': parseInt,
  'Float': parseFloat,
  'Bool': el => el.toLowerCase() == 'true'
}

function newInstance(name, args) {
  // console.log(name, args)
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

var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "MAIN", "symbols": ["_", "VALUE", "_"], "postprocess": d => d[1]},
    {"name": "VARNAME$ebnf$1", "symbols": [/[a-zA-Z0-9]/]},
    {"name": "VARNAME$ebnf$1", "symbols": ["VARNAME$ebnf$1", /[a-zA-Z0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "VARNAME", "symbols": ["VARNAME$ebnf$1"], "postprocess": d => d[0].join("")},
    {"name": "STR$ebnf$1", "symbols": []},
    {"name": "STR$ebnf$1", "symbols": ["STR$ebnf$1", /./], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "STR", "symbols": ["STR$ebnf$1"], "postprocess": d => d[0].join("")},
    {"name": "NUM$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "NUM$ebnf$1", "symbols": ["NUM$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "NUM", "symbols": ["NUM$ebnf$1"], "postprocess": d => d[0].join("")},
    {"name": "BINARY$ebnf$1", "symbols": [/[01]/]},
    {"name": "BINARY$ebnf$1", "symbols": ["BINARY$ebnf$1", /[01]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "BINARY", "symbols": ["BINARY$ebnf$1"], "postprocess": d => d[0].join("")},
    {"name": "HEX$ebnf$1", "symbols": [/[0-9A-Fa-f]/]},
    {"name": "HEX$ebnf$1", "symbols": ["HEX$ebnf$1", /[0-9A-Fa-f]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "HEX", "symbols": ["HEX$ebnf$1"], "postprocess": d => d[0].join("")},
    {"name": "OCTAL$ebnf$1", "symbols": [/[0-7]/]},
    {"name": "OCTAL$ebnf$1", "symbols": ["OCTAL$ebnf$1", /[0-7]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "OCTAL", "symbols": ["OCTAL$ebnf$1"], "postprocess": d => d[0].join("")},
    {"name": "SIGN", "symbols": [{"literal":"+"}]},
    {"name": "SIGN", "symbols": [{"literal":"-"}], "postprocess": d => d[0]},
    {"name": "NUMBER", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": d => preprocessFloat(d[0].value)},
    {"name": "NUMBER", "symbols": [{"literal":"0b"}, "BINARY"], "postprocess": d => preprocessInt(d[1], 2)},
    {"name": "NUMBER", "symbols": [{"literal":"0x"}, "HEX"], "postprocess": d => preprocessInt(d[1], 16)},
    {"name": "NUMBER", "symbols": [{"literal":"0o"}, "OCTAL"], "postprocess": d => preprocessInt(d[1], 8)},
    {"name": "BOOLEAN", "symbols": [{"literal":"true"}]},
    {"name": "BOOLEAN", "symbols": [{"literal":"false"}], "postprocess": d => d[0] == "true" ? true : false},
    {"name": "NULL", "symbols": [{"literal":"null"}], "postprocess": d => null},
    {"name": "STRING", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": d => preprocessString(d[0].value)},
    {"name": "KEYVALUE", "symbols": [(lexer.has("identifier") ? {type: "identifier"} : identifier), "_", {"literal":":"}, "_", "VALUE"], "postprocess": d => [ d[0].value, d[4] ]},
    {"name": "KEYVALUE", "symbols": [(lexer.has("string") ? {type: "string"} : string), "_", {"literal":":"}, "_", "VALUE"], "postprocess": d => [ preprocessString(d[0].value), d[4] ]},
    {"name": "CSKEYVALUE", "symbols": ["KEYVALUE", "_", {"literal":","}, "_", "CSKEYVALUE"], "postprocess": d => [ d[0], ...d[4] ]},
    {"name": "CSKEYVALUE", "symbols": ["KEYVALUE"], "postprocess": d => [ d[0] ]},
    {"name": "CSVALUE", "symbols": ["VALUE", "_", {"literal":","}, "_", "CSVALUE"], "postprocess": d => [ d[0], ...d[4] ]},
    {"name": "CSVALUE", "symbols": ["VALUE"], "postprocess": d => [ d[0] ]},
    {"name": "DICT", "symbols": [{"literal":"{"}, "_", "CSKEYVALUE", "_", {"literal":"}"}], "postprocess": d => d[2].reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {})},
    {"name": "DICT", "symbols": [{"literal":"{"}, "_", {"literal":"}"}], "postprocess": d => { return {} }},
    {"name": "ARRAY", "symbols": [{"literal":"["}, "_", "CSVALUE", "_", {"literal":"]"}], "postprocess": d => d[2]},
    {"name": "ARRAY", "symbols": [{"literal":"["}, "_", {"literal":"]"}], "postprocess": d => { return [] }},
    {"name": "VALUE", "symbols": ["NUMBER"], "postprocess": d => { return d[0] }},
    {"name": "VALUE", "symbols": ["STRING"], "postprocess": d => { return d[0] }},
    {"name": "VALUE", "symbols": ["DICT"], "postprocess": d => { return d[0] }},
    {"name": "VALUE", "symbols": ["ARRAY"], "postprocess": d => { return d[0] }},
    {"name": "VALUE", "symbols": ["CONS"], "postprocess": d => { return d[0] }},
    {"name": "VALUE", "symbols": ["BOOLEAN"], "postprocess": d => { return d[0] }},
    {"name": "VALUE", "symbols": ["NULL"], "postprocess": d => { return d[0] }},
    {"name": "CONS", "symbols": [(lexer.has("identifier") ? {type: "identifier"} : identifier), "_", {"literal":"("}, "_", {"literal":")"}], "postprocess": d => { return newInstance(d[0].value, []) }},
    {"name": "CONS", "symbols": [(lexer.has("identifier") ? {type: "identifier"} : identifier), "_", {"literal":"("}, "_", "CSVALUE", "_", {"literal":")"}], "postprocess": d => { return newInstance(d[0].value, d[4]) }},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", /[\s]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": function(d) {return null }}
]
  , ParserStart: "MAIN"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
