/**
 * Status Message
 *
 *
 */
function log(message, severity, id)
{
	var log = $(id || '#log').html();
	$(id || '#log').append('<li class="log ' + (severity || 'info') + ' translate">' + message + '</li>');
	console.log((severity !== undefined ? severity.toUpperCase() : 'INFO') + ': ' + message);
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
			obj[key] = $this.val();
	});
	
	callback(obj);
}
