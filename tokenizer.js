module.exports = tokenize;

var syntax = {
	number: /^(-?\d+)/,
	identifier: /^([a-zA-Zåäö]+[a-zA-Zåäö_$\d]*)/,
	operator: /^([:=+*\.])/,
	fullstop: /^(\.)/,
	space: /^(\s+)/,
};

function capitalize(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

var peek = {};
var get = {};

var syntaxes = ['operator','number','identifier', 'fullstop', 'space'];
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
		syntaxes.forEach(function (tokentype) {
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
};