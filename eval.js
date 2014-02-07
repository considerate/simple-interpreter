var syntax = {
	number: /^(-?\d+)/,
	identifier: /^([a-zA-Zåäö]+[a-zA-Zåäö_$\d]*)/,
	equals: /^(=)/,
	fullstop: /^(\.)/,
	space: /^(\s+)/,
};

/*
Program: ( (Statement|Expression) Fullstop)+
Statement: Assignement 
Assignment: Identifier Equals Expression
Expression: Identifier|Number
Fullstop: .
*/

function capitalize(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

var peek = {};
var get = {};

var syntaxes = ['equals','number','identifier', 'fullstop', 'space'];
syntaxes.forEach(function(word) {
	var caps = capitalize(word);
	peek[word] = function (input, index) {
		var text = input.substring(index);
		var match = syntax[word].exec(text);
		if(match) {
			return {
				text: match[1],
				length: match[0].length
			};
		}
		return null;			
	};
	get[word] = function(input, index) {
		var text = input.substring(index);
		
		var match = syntax[word].exec(text);
		var src = match[1];
		return {
			token: {
				src: src,
				type: word
			},
			length: match[0].length
		};
	}
}, this);

/*
peek.assignment = function (input, index) {
	var hasIdentifier = peek.identifier(input, index);
	if(!hasIdentifier) {
		return false;
	}
	index = index + hasIdentifier.length;
	var hasEquals = peek.equals(input, index);
	if(!hasEquals) {
		return false;
	}
	index = index + hasEquals.length;
	var hasExpression = peek.expression(input, index);
	if(!hasExpression) {
		return false;
	}
	return {
		text: hasIdentifier.text + hasEquals.text + hasExpression.text,
		length: hasIdentifier.length + hasEquals.length + hasExpression.length
	};
}

peek.statement = function(input, index) {
	var hasAssignment = peek.assignment(input,index);
	if(!hasAssignment) {
		return false;
	}
	index = index + hasAssignment.length;
	var hasFullstop = peek.fullstop(input, index);
	if(!hasFullstop) {
		return false;
	}
	return {
		text: hasAssignment.text + hasFullstop.text,
		length: hasAssignment.length + hasFullstop.length
	}
}

peek.expression = function(input, index) {
	return (peek.identifier(input, index) || peek.number(input, index));
}


get.assignment = function(input, index) {
	var origindex = index;
	var tokens = [];
	var info 
	info = get.identifier(input,index);
	index += info.length;
	tokens = tokens.concat(info.tokens);
	
	info = get.equals(input,index);
	index += info.length;
	tokens = tokens.concat(info.tokens);

	info = get.expression(input, index);
	index += info.length;
	tokens = tokens.concat(info.tokens);

	var length = (index - origindex);
	return {
		tokens: tokens,
		length: length
	}
}

get.expression =  function (input, index) {
	if(peek.identifier(input, index)) {
		return get.identifier(input, index);
	} else if (peek.number(input, index)) {
		return get.number(input,index);
	} else {
		throw new Error('Syntax error.');
	}
}

get.statement = function (input, index) {
	if(peek.assignment(input, index)) {
		return get.assignment(input,index);
	} else {
		throw new Error('Syntax error.');
	}
}

function tokenizer(input) {
	var tokens = [];
	var index = 0;
	var info;

	function hasInput(input, index) {
		if(input.length === index) {
			return false;
		}
		return true;
	}

	while(hasInput(input,index)) {
		if(peek.statement(input,index)) {
			info = get.statement(input,index);
			tokens = tokens.concat(info.tokens);
			index += info.length;

			info = get.fullstop(input, index);
			index += info.length;
			tokens = tokens.concat(info.tokens);			
		} else if(peek.expression(input,index)) {
			info = get.expression(input,index);
			tokens = tokens.concat(info.tokens);
			index += info.length;

			info = get.fullstop(input, index);
			index += info.length;
			tokens = tokens.concat(info.tokens);	
		} else {
			throw new Error('Syntax error');
		}
	}

	return tokens;
}*/



function tokenize(input) {
	var index = 0;
	var tokens = [];
	function hasInput(input, index) {
		if(input.length === index) {
			return false;
		}
		return true;
	}

	while(hasInput(input, index)) {
		var didHaveToken = false;
		['identifier','number','equals', 'fullstop', 'space'].forEach(function (tokentype) {
			if(peek[tokentype](input,index)) {
				var info = get[tokentype](input,index);
				index += info.length;
				tokens.push(info.token);
				didHaveToken = true;
			}
		});
		if(!didHaveToken) {
			throw new Error('Syntax error.');
		}
	}
	return tokens;
}

function parse(tokens) {
 	function peek(tokens, type, count) {
 		count = count || 1;
 		var token = tokens[0];
 		if(token.type === type) {
 			return true;
 		}
 		return false;
 	}
 	function consume(tokens, type) {
 		if(peek(tokens,type)) {
 			//Remove first element and return it
 			return tokens.shift();
 		}
 		return false;
 	}

 	function parseExpression(tokens) {
 		var result;
 		result = consume(tokens,'number');
 		var types = ['identifier', 'number'];
 		for(var i = 0; i < types.length; i++) {
 			var type = types[i];
 		 	result = consume(tokens,type);
	 		if(result) {
	 			return result;
	 		}	
 		}
		throw new Error('Syntax error. No expression found.');	
 	}

 	function peekExpression(tokens) {
  		var types = ['identifier', 'number'];
 		for(var i = 0; i < types.length; i++) {
 			var type = types[i];
 		 	if(peek(tokens,type)) {
 		 		return true
 		 	}
 		}
 		return false;	
 	}

 	function peekAssignment(tokens) {
 		var clone = tokens.slice();
 		if(!consume(clone, 'identifier')) {
 			return false;
 		}
 		consume(clone,'space');
 		if(!consume(clone, 'equals')) {
 			return false;
 		}
 		consume(clone,'space');
 		if(!peekExpression(clone)) {
 			return false;
 		}
 		return true;
 	}

 	function peekStatement(tokens) {
 		var clone = tokens.slice();
 		return peekAssignment(clone);
 	}

 	function parseExpression(tokens) {
   		var types = ['identifier', 'number'];
 		for(var i = 0; i < types.length; i++) {
 			var type = types[i];
 		 	if(peek(tokens,type)) {
 		 		var token = consume(tokens,type);
 		 		return {
 		 			type: 'expression',
 		 			expressionType: type,
 		 			src: token.src
 		 		}
 		 	}
 		}
 		throw new Error('Compiler error.');		
 	}

 	function parseAssignment(tokens) {
 		var identifier = consume(tokens,'identifier');
 		consume(tokens,'space');
 		consume(tokens,'equals');
 		consume(tokens,'space');
 		var expression = parseExpression(tokens);
 		return {
 			type: 'statement',
 			statementType: 'assignment',
 			left: identifier,
 			right: expression
 		};
 	}

 	function parseStatement(tokens) {
 		if(peekAssignment(tokens)) {
 			return parseAssignment(tokens);
 		}
 	}

 	var program = [];
 	while(tokens.length > 0) {
 		if(peekStatement(tokens)) {
 			var statement = parseStatement(tokens);
 			program.push(statement);
 			var consumed = consume(tokens, 'fullstop');
 			if(!consumed) {
 				console.log('No end of statement, missing ".".');
 			}
 		} else if(peekExpression(tokens)) {
 			var expression = parseExpression(tokens);
 			program.push(expression);
 			var consumed = consume(tokens, 'fullstop');
 			if(!consumed) {
 				console.log('No end of expression, missing ".".');
 			}
 		} else if (peek(tokens,'space')) {
 			consume(tokens,'space');
 		}
 		else {
 			console.log('error');
 		}
 	}
 	return program;
}
var input = "x   = -53. x.";
var tokens = tokenize(input);
var program = parse(tokens);
console.log(program);
