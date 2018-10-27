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

/**
 * Load settings.
 *
 *
 */
function load(settings, onChange)
{
	if (!settings)
		return;
	
	$('.value').each(function ()
	{            
		var $key = $(this);
		var id = $key.attr('id');
		if ($key.attr('type') === 'checkbox')
			$key.prop('checked', settings[id]).on('change', function() {onChange();});
		else
			$key.val(settings[id]).on('change', function() {onChange();}).on('keyup', function() {onChange();});
	});
	
	onChange(false);
	M.updateTextFields();
}

/**
 * Save settings.
 *
 *
 */
function save(callback)
{
	var obj = {};
	$('.value').each(function ()
	{
		var $this = $(this);
		var key = $this.attr('id');
		
		if ($this.attr('type') === 'checkbox')
			obj[key] = $this.prop('checked');
		else
			obj[key] = settings.decode.fields.indexOf(key) > -1 ? decode(settings.decode.key, $this.val()) : $this.val();
	});
	
	callback(obj);
}
