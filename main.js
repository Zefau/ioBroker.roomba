'use strict';
const utils = require(__dirname + '/lib/utils'); // Get common adapter utils
const adapter = utils.Adapter('roomba');

const dgram = require('dgram');
const tls = require('tls');
const Roomba = require('dorita980');


/*
 * internal libraries
 */
const Library = require(__dirname + '/library.js');


/*
 * variables initiation
 */
var library = new Library(adapter);;
var robot;
var settings = {
	decode: {
		key: 'hZTFui87HVG45shg$', // used for encrypted password
		fields: ['password']
	}
};

var listeners = ['start', 'stop', 'pause', 'resume', 'dock']; // state that trigger actions
var nodes = [
	// cleaning
	{'node': 'cleaning.start', 'description': 'Start a cleaning process', 'action': 'start', 'role': 'button.start', 'type': 'boolean'},
	{'node': 'cleaning.stop', 'description': 'Stop the current cleaning process', 'action': 'stop', 'role': 'button.stop', 'type': 'boolean'},
	{'node': 'cleaning.pause', 'description': 'Pause the current cleaning process', 'action': 'pause', 'role': 'button.pause', 'type': 'boolean'},
	{'node': 'cleaning.resume', 'description': 'Resume the current cleaning process', 'action': 'resume', 'role': 'button.resume', 'type': 'boolean'},
	{'node': 'cleaning.dock', 'description': 'Send the robot to the docking station', 'action': 'dock', 'role': 'button', 'type': 'boolean'},
	
	// cleaning - schedule
	{'node': 'cleaning.schedule.cycle', 'description': 'Schedule cycle (Sunday to Saturday)', 'preference': 'cleanSchedule.cycle', 'role': 'text'},
	{'node': 'cleaning.schedule.hours', 'description': 'Hour to start cycle (Sunday to Saturday)', 'preference': 'cleanSchedule.h', 'role': 'text'},
	{'node': 'cleaning.schedule.minutes', 'description': 'Minute to start cycle (Sunday to Saturday)', 'preference': 'cleanSchedule.m', 'role': 'text'},
	
	// cleaning - last command
	{'node': 'cleaning.last.command', 'description': 'Last command sent to robot', 'preference': 'lastCommand.command', 'role': 'text'},
	{'node': 'cleaning.last.timestamp', 'description': 'Timestamp last command was sent', 'preference': 'lastCommand.time', 'role': 'value'},
	{'node': 'cleaning.last.datetime', 'description': 'DateTime last command was sent', 'preference': 'lastCommand.time', 'kind': 'datetime', 'role': 'text'},
	{'node': 'cleaning.last.initiator', 'description': 'Initiator of last command', 'preference': 'lastCommand.initiator', 'role': 'text'},
	
	// device
	{'node': 'device.mac', 'description': 'Mac address of the robot', 'preference': 'mac', 'role': 'info.mac'},
	{'node': 'device.name', 'description': 'Name of the robot', 'preference': 'name', 'role': 'info.name'},
	
	// device - network
	{'node': 'device.network.dhcp', 'description': 'State whether DHCP is activated', 'preference': 'netinfo.dhcp'},
	{'node': 'device.network.router', 'description': 'Mac address of router', 'preference': 'netinfo.bssid', 'role': 'text'},
	{'node': 'device.network.ip', 'description': 'IP address', 'preference': 'netinfo.addr', 'kind': 'ip', 'role': 'info.ip'},
	{'node': 'device.network.subnet', 'description': 'Subnet adress', 'preference': 'netinfo.mask', 'kind': 'ip', 'role': 'info.ip'},
	{'node': 'device.network.gateway', 'description': 'Gateway address', 'preference': 'netinfo.gw', 'kind': 'ip', 'role': 'info.ip'},
	{'node': 'device.network.dns1', 'description': 'Primary DNS address', 'preference': 'netinfo.dns1', 'kind': 'ip', 'role': 'info.ip'},
	{'node': 'device.network.dns2', 'description': 'Secondary DNS address', 'preference': 'netinfo.dns2', 'kind': 'ip', 'role': 'info.ip'},
	
	// device - versions
	{'node': 'device.versions.hardwareRev', 'description': '', 'preference': 'hardwareRev', 'role': 'text'},
	{'node': 'device.versions.batteryType', 'description': '', 'preference': 'batteryType', 'role': 'text'},
	{'node': 'device.versions.soundVer', 'description': '', 'preference': 'soundVer', 'role': 'text'},
	{'node': 'device.versions.uiSwVer', 'description': '', 'preference': 'uiSwVer', 'role': 'text'},
	{'node': 'device.versions.navSwVer', 'description': '', 'preference': 'navSwVer', 'role': 'text'},
	{'node': 'device.versions.wifiSwVer', 'description': '', 'preference': 'wifiSwVer', 'role': 'text'},
	{'node': 'device.versions.mobilityVer', 'description': '', 'preference': 'mobilityVer', 'role': 'text'},
	{'node': 'device.versions.bootloaderVer', 'description': '', 'preference': 'bootloaderVer', 'role': 'text'},
	{'node': 'device.versions.umiVer', 'description': '', 'preference': 'umiVer', 'role': 'text'},
	{'node': 'device.versions.softwareVer', 'description': '', 'preference': 'softwareVer', 'role': 'text'},
	
	// preferences
	{'node': 'device.preferences.noAutoPasses', 'description': 'One Pass: Roomba will cover all areas with a single cleaning pass.', 'preference': 'noAutoPasses', 'role': 'state', 'type': 'boolean'},
	{'node': 'device.preferences.noPP', 'description': '', 'preference': 'noPP', 'role': 'state', 'type': 'boolean'},
	{'node': 'device.preferences.binPause', 'description': '', 'preference': 'binPause', 'role': 'state', 'type': 'boolean'},
	{'node': 'device.preferences.openOnly', 'description': '', 'preference': 'openOnly', 'role': 'state', 'type': 'boolean'},
	{'node': 'device.preferences.twoPass', 'description': 'Roomba will cover all areas a second time. This may be helpful in homes with pets or for occasional deep cleaning.', 'preference': 'twoPass', 'role': 'state', 'type': 'boolean'},
	{'node': 'device.preferences.schedHold', 'description': '', 'preference': 'schedHold', 'role': 'state', 'type': 'boolean'},
	
	{'node': 'device.preferences.carpetBoostAuto', 'description': 'Automatic: Roomba will automatically boost its vacuum power to deep clean carpets.', 'preference': 'carpetBoost', 'role': 'state', 'type': 'boolean'},
	{'node': 'device.preferences.carpetBoostHigh', 'description': 'Performance Mode: Roomba will always boost its vacuum to maximise cleaning performance on all floor surfaces.', 'preference': 'vacHigh', 'role': 'state', 'type': 'boolean'},
	{'node': 'device.preferences.ecoCharge', 'description': '', 'preference': 'ecoCharge', 'role': 'state', 'type': 'boolean'},
	
	
	// states
	{'node': 'states.battery', 'description': 'Battery level of the robot', 'preference': 'batPct', 'role': 'value'},
	{'node': 'states.docked', 'description': 'State whether robot is docked', 'preference': 'dock.known', 'role': 'state', 'type': 'boolean'},
	{'node': 'states.binInserted', 'description': 'State whether bin is inserted', 'preference': 'bin.present', 'role': 'state', 'type': 'boolean'},
	{'node': 'states.binFull', 'description': 'State whether bin status is full', 'preference': 'bin.full', 'role': 'state', 'type': 'boolean'},
	{'node': 'states.status', 'description': 'Current status of the robot', 'preference': 'cleanMissionStatus.phase', 'role': 'text'},
	{'node': 'states.signal', 'description': 'Signal strength', 'preference': 'signal.snr', 'role': 'value'},
	
	// statistics - missions
	{'node': 'statistics.time.avgMin', 'description': '', 'preference': 'bbchg3.avgMin', 'role': 'value'},
	{'node': 'statistics.time.hOnDock', 'description': '', 'preference': 'bbchg3.hOnDock', 'role': 'value'},
	{'node': 'statistics.time.nAvail', 'description': '', 'preference': 'bbchg3.nAvail', 'role': 'value'},
	{'node': 'statistics.time.estCap', 'description': '', 'preference': 'bbchg3.estCap', 'role': 'value'},
	{'node': 'statistics.time.nLithChrg', 'description': '', 'preference': 'bbchg3.nLithChrg', 'role': 'value'},
	{'node': 'statistics.time.nNimhChrg', 'description': '', 'preference': 'bbchg3.nNimhChrg', 'role': 'value'},
	{'node': 'statistics.time.nDocks', 'description': '', 'preference': 'bbchg3.nDocks', 'role': 'value'},
	
	// statistics - missions
	{'node': 'statistics.missions.total', 'description': 'Number of cleaning jobs', 'preference': 'bbmssn.nMssn', 'role': 'value'},
	{'node': 'statistics.missions.succeed', 'description': 'Number of successful cleaning jobs', 'preference': 'bbmssn.nMssnOk', 'role': 'value'},
	//{'node': 'statistics.missionsC', 'description': '', 'preference': 'bbmssn.nMssnC', 'role': 'value'},
	{'node': 'statistics.missions.failed', 'description': 'Number of failed cleaning jobs', 'preference': 'bbmssn.nMssnF', 'role': 'value'},
	//{'node': 'statistics.missions', 'description': '', 'preference': 'bbmssn.aMssnM', 'role': 'value'},
	//{'node': 'statistics.missions', 'description': '', 'preference': 'bbmssn.aCycleM', 'role': 'value'},
];


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
		adapter.log.warn('Username, password and / or ip address missing!');
		return;
	}
	
	// connect to Roomba
	robot = new Roomba.Local(adapter.config.username, library.decode(settings.decode.key, adapter.config.password), adapter.config.ip); // username, password, ip
	
	
	// check if connection is successful
	var nodeConnected = {'node': 'states._connected', 'description': 'Connection state'};
	
	/*
	 * ROBOT ERROR
	 */
	robot.on('error', function(err)
	{
		adapter.log.warn(err.message);
		library.set(nodeConnected, false);
	});
	 
	/*
	 * ROBOT CONNECT
	 */
	robot.on('connect', function()
	{
		adapter.log.debug('Roomba Connection established.');
		library.set(nodeConnected, true);
	});
	
	/*
	 * ROBOT CLOSE
	 */
	robot.on('close', function(res)
	{
		adapter.log.debug('Roomba Connection closed.');
		library.set(nodeConnected, false);
	});
	
	/*
	 * ROBOT OFFLINE
	 */
	robot.on('offline', function(res)
	{
		adapter.log.debug('Roomba offline.');
		library.set(nodeConnected, false);
	});
	
	/*
	 * ROBOT MISSION
	 */
	robot.on('mission', function(res)
	{
		//adapter.log.debug(JSON.stringify(res));
		//library.set(Object.assign(node, {common: {role: 'button', 'type': 'boolean'}}), false);
		
		
	});
	
	/*
	 * ROBOT PREFERENCES
	 */
	updPreferences();
	setInterval(updPreferences, adapter.config.refresh ? Math.round(parseInt(adapter.config.refresh)*1000) : 60000);
});

/*
 * STATE CHANGE
 *
 */
adapter.on('stateChange', function(node, state)
{
	//adapter.log.debug('State of ' + node + ' has changed ' + JSON.stringify(state) + '.');
	var action = node.substr(node.lastIndexOf('.')+1);
	
	if (listeners.indexOf(action) > -1 && state.ack !== true)
	{
		adapter.log.info('Triggered action -' + action + '- on Roomba.');
		robot[action]();
	}
});

/*
 * HANDLE MESSAGES
 *
 */
adapter.on('message', function(msg)
{
	adapter.log.debug('Message: ' + JSON.stringify(msg));
	
	switch(msg.command)
	{
		case 'getIp':
			Roomba.getRobotIP(function(err, ip)
			{
				adapter.log.debug('Retrieved IP address: ' + ip);
				library.msg(msg.from, msg.command, err ? {result: false, error: err.message} : {result: true, ip: ip}, msg.callback);
			});
			break;
			
		case 'getRobotData':
			getRobotData(function(res)
			{
				adapter.log.debug('Retrieved robot data: ' + JSON.stringify(res));
				library.msg(msg.from, msg.command, res, msg.callback);
			}, msg.message !== null ? msg.message.ip : undefined);
			break;
			
		case 'getPassword':
			getPassword(msg.message.ip, function(res)
			{
				adapter.log.debug('Retrieved password: ' + JSON.stringify(res));
				library.msg(msg.from, msg.command, res, msg.callback);
			});
			break;
	}
});


/**
 * Get password.
 *
 * @param	{string}	ip
 * @param	{function}	callback
 * @return	{object}	result
 *
 */
function getPassword(ip, callback)
{
	// connect
	var client = tls.connect(8883, ip, {rejectUnauthorized: false});
	client.once('secureConnect', function()
	{
		adapter.log.debug("Connected to Roomba!");
		client.write(new Buffer('f005efcc3b2900', 'hex'));
	});
	
	// error
	client.on('error', function(err)
	{
		callback({result: false, error: 'Connection failed!'});
	});
	
	// extract password
	try
	{
		var sliceFrom = 13;
		client.on('data', function(data)
		{
			if (data.length === 2)
			{
				sliceFrom = 9;
				return;
			}
			
			if (data.length <= 7)
				callback({result: false, error: 'Failed getting password! MAKE SURE TO PRESS AND HOLD --HOME-- BUTTON 2 SECONDS (not the clean button)!'});
			
			else
			{
				adapter.log.debug('Successfully retrieved password.');
				callback({result: true, data: {password: new Buffer(data).slice(sliceFrom).toString()}});
			}
			
			client.end();
		});
		
		client.setEncoding('utf-8');
	}
	catch(err)
	{
		adapter.log.debug('ERROR: ' + err.message);
		callback({result: false, error: 'Could not retrieve password from Roomba! MAKE SURE TO PRESS AND HOLD --HOME-- BUTTON 2 SECONDS (not the clean button)!'});
	}
}


/**
 * Get user.
 *
 * @param	{function}	callback
 * @param	{string}	ip			(optional) IP address (otherwise broadcast will be tried)
 * @return	{object}	result
 *
 */
function getRobotData(callback, ip)
{
	const server = dgram.createSocket('udp4');
	
	server.bind(5678, function()
	{
		const message = new Buffer('irobotmcs');
		if (ip === undefined)
		{
			server.setBroadcast(true);
			server.send(message, 0, message.length, 5678, '255.255.255.255');
		}
		else
			server.send(message, 0, message.length, 5678, ip);
	});
	
	server.on('error', function(err)
	{
		server.close();
		callback({result: false, error: err});
	});
	
	server.on('message', function(msg)
	{
		try
		{
			let parsedMsg = JSON.parse(msg);
			if (parsedMsg.hostname && parsedMsg.ip && parsedMsg.hostname.split('-')[0] === 'Roomba')
			{
				server.close();
				parsedMsg.user = parsedMsg.hostname.split('-')[1];
				callback({result: true, data: parsedMsg});
			}
		}
		catch(err) {}
	});
}


/**
 * Update preferences.
 *
 * @param	none
 * @return	void
 *
 */
function updPreferences()
{
	var tmp, preference, index;
	robot.getPreferences().then((preferences) =>
	{
		adapter.log.debug('Retrieved preferences: ' + JSON.stringify(preferences));
		library.set({'node': 'device._rawData', 'description': 'Raw preferences data as json', 'role': 'json'}, JSON.stringify(preferences));
		
		nodes.forEach(function(node)
		{
			try
			{
				// action
				if (node.action !== undefined)
				{
					library.set(Object.assign(node, {common: {role: 'button', 'type': 'boolean'}}), false);
					adapter.subscribeStates(node.node); // attach state listener
				}
				
				// preference
				if (node.preference !== undefined)
				{
					tmp = Object.assign({}, preferences);
					preference = node.preference;
					
					// go through preferences
					while (preference.indexOf('.') > -1)
					{
						index = preference.substr(0, preference.indexOf('.'));
						preference = preference.substr(preference.indexOf('.')+1);
						tmp = tmp[index];
					}
					
					if (node.kind !== undefined)
					{
						switch(node.kind.toLowerCase())
						{
							case "ip":
								tmp[preference] = library.getIP(tmp[preference]);
								break;
							
							case "datetime":
								tmp[preference] = library.getDateTime(tmp[preference]*1000);
								break;
						}
					}
					
					library.set(node, tmp[preference]);
				}
			}
			catch(err) {adapter.log.error(JSON.stringify(err.message))}
		});
	});
	
	library.set({'node': 'refreshedTimestamp', 'description': 'Timestamp of last update', 'role': 'value'}, Math.floor(Date.now()/1000));
	library.set({'node': 'refreshedDateTime', 'description': 'DateTime of last update', 'role': 'text'}, library.getDateTime(Date.now()));
};