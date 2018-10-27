/**
 * Decodes a string with given key.
 *
 * @param {string} key
 * @param {string} string
 * @return {string}
 *
 */
function decode(key, string)
{
    var result = '';
    for (var i=0; i < string.length; ++i) {
		result += String.fromCharCode(key[i % key.length].charCodeAt(0) ^ string.charCodeAt(i));
    }
	
    return result;
}

/**
 * Encode a string with given key.
 *
 * @param {string} key
 * @param {string} string
 * @return {string}
 *
 */
function encode(key, string)
{
	var result = '';
	for(var i = 0; i < string.length; i++) {
		result += String.fromCharCode(key[i % key.length].charCodeAt(0) ^ string.charCodeAt(i));
	}
	
	return result;
}


/*
 * EXPORT modules
 */
module.exports.decode = decode;
module.exports.encode = encode;
