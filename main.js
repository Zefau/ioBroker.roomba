'use strict';
var utils = require(__dirname + '/lib/utils'); // Get common adapter utils
var adapter = utils.adapter('roomba');

/*
 * internal libraries
 */
var library = require(__dirname + '/library.js');
var Roomba = require(__dirname + '/roomba.js');

/*
 * variables initiation
 */
var robot;
var settings = {
	decode: {
		key: 'hZTFui87HVG45shg$', // used for encrypted password
		fields: ['password']
	},
	nodes: [
		{'node': 'commands', 'description': 'Commands to send to robot', 'children': []},
		{'node': 'robot', 'description': 'Robot stuff', 'children': [
			{'node': 'mac', 'description': 'Mac Address', 'link': 'mac'}
		]},
		{'node': 'status', 'description': 'Status and so on', 'children': [
			{'node': 'docked', 'description': 'State if robot is in the dock', 'link': 'batPct'},
			{'node': 'folder', 'description': 'New Folder', 'children': [
				{'node': 'docky', 'description': 'State if robot is in the dock', 'link': 'batteryType'},
			]},
		]},
	]
}

/*
 * ADAPTER UNLOAD
 *
 */
adapter.on('unload', function(callback)
{
    try
	{
        adapter.log.info('cleaned everything up...');
        callback();
    }
	catch(e)
	{
        callback();
    }
});

/*
 * ADAPTER READY
 *
 */
adapter.on('ready', function()
{
	// check if settings are set
	if (!adapter.config.username || !adapter.config.password || !adapter.config.ip)
	{
		adapter.log.error('Username, password and / or ip address missing!');
		return;
	}
	
	robot = new Roomba({'username': adapter.config.username, 'password': library.decode(settings.decode.key, adapter.config.password), 'ip': adapter.config.ip}, adapter);
	
	robot.updPreferences(
		function(preferences) {updStates(settings.nodes, adapter.namespace)}
	);
	
	/*
	setInterval(function() {
		robot.updPreferences(
			function() {updStates(settings.nodes, adapter.namespace)}
		)
	}, 10000);
	*/
});


/**
 * Create a node.
 *
 *
 */
function createNode(node)
{
	adapter.setForeignObject(node.node,
	{
		common: Object.assign(node.common || {}, {
			name: node.description || '',
			role: node.common !== undefined && node.common.role ? node.common.role : 'state',
			type: node.common !== undefined && node.common.type ? node.common.type : 'string'
		}),
		type: 'state',
		native: node.native || {}
	});
}


/**
 * 
 *
 *
 */
function updStates(nodes, parent)
{
	//
	nodes.forEach(function(node)
	{
		// if type is array, then create folder and loop
		if (node.children !== undefined)
		{
			// create channel
			node.node = parent + '.' + node.node;
			adapter.getForeignObject(node.node, function(err, obj)
			{
				if (!obj) {
					adapter.log.debug('Created node ' + node.node);
					createNode(node);
				}
			});
			
			// loop through nodes
			updStates(node.children, node.node);
		}
		
		// if type is string, then create state
		else if (node.link !== undefined)
		{
			node.node = parent + '.' + node.node;
			adapter.getForeignObject(node.node, function(err, obj)
			{
				if (!obj) {
					adapter.log.debug('Created state ' + node.node);
					createNode(node);
				}
			});
			
			adapter.setState(node.node, {val: robot.get(node.link),  ts: Date.now(), ack: true});
		}
	});
}
