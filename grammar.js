// Generated automatically by nearley, version 2.15.0
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }


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

var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "MAIN", "symbols": ["_", "VALUE", "_"], "postprocess": d => d[1]},
    {"name": "BIN$ebnf$1", "symbols": [/[01]/]},
    {"name": "BIN$ebnf$1", "symbols": ["BIN$ebnf$1", /[01]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "BIN", "symbols": ["BIN$ebnf$1"], "postprocess": d => d[0].join("")},
    {"name": "HEX$ebnf$1", "symbols": [/[0-9A-Fa-f]/]},
    {"name": "HEX$ebnf$1", "symbols": ["HEX$ebnf$1", /[0-9A-Fa-f]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "HEX", "symbols": ["HEX$ebnf$1"], "postprocess": d => d[0].join("")},
    {"name": "OCT$ebnf$1", "symbols": [/[0-7]/]},
    {"name": "OCT$ebnf$1", "symbols": ["OCT$ebnf$1", /[0-7]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "OCT", "symbols": ["OCT$ebnf$1"], "postprocess": d => d[0].join("")},
    {"name": "BOOLEAN", "symbols": [{"literal":"true"}]},
    {"name": "BOOLEAN", "symbols": [{"literal":"false"}], "postprocess": d => d[0] == "true" ? true : false},
    {"name": "NULL", "symbols": [{"literal":"null"}], "postprocess": d => null},
    {"name": "NAN", "symbols": [{"literal":"NaN"}], "postprocess": d => NaN},
    {"name": "INFINITY", "symbols": [{"literal":"Infinity"}], "postprocess": d => Infinity},
    {"name": "HEXNUM", "symbols": [(lexer.has("hex") ? {type: "hex"} : hex)], "postprocess": d => preprocessInt(d[0].value.substr(2), 16)},
    {"name": "OCTNUM", "symbols": [(lexer.has("oct") ? {type: "oct"} : oct)], "postprocess": d => preprocessInt(d[0].value.substr(2), 8)},
    {"name": "BINNUM", "symbols": [(lexer.has("bin") ? {type: "bin"} : bin)], "postprocess": d => preprocessInt(d[0].value.substr(2), 2)},
    {"name": "DECNUM", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": d => preprocessFloat(d[0].value)},
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
    {"name": "VALUE", "symbols": ["STRING"], "postprocess": d => { return d[0] }},
    {"name": "VALUE", "symbols": ["DICT"], "postprocess": d => { return d[0] }},
    {"name": "VALUE", "symbols": ["ARRAY"], "postprocess": d => { return d[0] }},
    {"name": "VALUE", "symbols": ["CONS"], "postprocess": d => { return d[0] }},
    {"name": "VALUE", "symbols": ["BOOLEAN"], "postprocess": d => { return d[0] }},
    {"name": "VALUE", "symbols": ["NULL"], "postprocess": d => { return d[0] }},
    {"name": "VALUE", "symbols": ["NAN"], "postprocess": d => { return d[0] }},
    {"name": "VALUE", "symbols": ["INFINITY"], "postprocess": d => { return d[0] }},
    {"name": "VALUE", "symbols": ["BINNUM"], "postprocess": d => { return d[0] }},
    {"name": "VALUE", "symbols": ["HEXNUM"], "postprocess": d => { return d[0] }},
    {"name": "VALUE", "symbols": ["OCTNUM"], "postprocess": d => { return d[0] }},
    {"name": "VALUE", "symbols": ["DECNUM"], "postprocess": d => { return d[0] }},
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
