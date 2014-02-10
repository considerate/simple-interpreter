module.exports = parse;

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
  		var start = false;
 		for(var i = 0; i < types.length; i++) {
 			var type = types[i];
 		 	if(peek(tokens,type)) {
 		 		start = true;
 		 		break;
 		 	}
 		}
 		if(!start) {
 			return false;
 		}
 		var operator = consume(tokens,'operator');
 		if(operator) {
 			if(operator.src === ':') {
 				return false;
 			}
 			return peekExpression(tokens);
 		} else {
 			return true;
 		}
 	}

 	function peekAssignment(tokens) {
 		var clone = tokens.slice();
 		if(!consume(clone, 'identifier')) {
 			return false;
 		}
 		consume(clone,'space');
 		var operator = consume(clone, 'operator'); 
 		if(!operator) {
 			return false;
 		}
 		if(operator.src !== ':') {
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

 	function parseExpressionStatement(tokens) {
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

 	function parseExpression(tokens) {
 		var expressionStatement = parseExpressionStatement(tokens);
 		consume(tokens,'space');
 		var operator = consume(tokens,'operator')
 		consume(tokens,'space');
 		if(operator) {
 			if(operator.src === '+') {
 				var right = parseExpression(tokens);
 				return {
 					type: 'expression',
 					expressionType: 'operator',
 					operator: '+',
 					left: expressionStatement,
 					right: right
 				}
 			}
 		} else {
 			return expressionStatement;
 		}
 	}

 	function parseAssignment(tokens) {
 		var identifier = consume(tokens,'identifier');
 		consume(tokens,'space');
 		consume(tokens,'operator');
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
 			console.log('error, invalid token: '+ JSON.stringify(tokens[0]));
 			return false;
 		}
 	}
 	return program;
}