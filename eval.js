var tokenize = require('./tokenizer');
var parse = require('./parser');

var input = "x   : -53. x + 2.";
var tokens = tokenize(input);
var program = parse(tokens);
console.log(program);
