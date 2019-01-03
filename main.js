'use strict';
const utils = require(__dirname + '/lib/utils'); // Get common adapter utils
const adapter = utils.Adapter('roomba');

const fs = require('fs');
const dgram = require('dgram');
const tls = require('tls');
const Roomba = require('dorita980');
const { createCanvas, Canvas } = require('canvas');
const { Image } = require('canvas');


/*
 * internal libraries
 */
const Library = require(__dirname + '/lib/library.js');
const Encryption = require(__dirname + '/lib/encryption.js');


/*
 * variables initiation
 */
var library = new Library(adapter);
var encryptor = new Encryption(adapter);

var robot, connected, mission, icons, pathColor;
var started;
var canvas, map, image, img;

var mapSize = {width: 1500, height: 1500};
var mapCenter = {h: Math.round(mapSize.width/2), v: Math.round(mapSize.height/2)};

var listeners = ['start', 'stop', 'pause', 'resume', 'dock']; // states that trigger actions
var nodes = [
	// commands
	{'node': 'commands', 'description': 'Actions and information of the cleaning process', 'role': 'channel'},
	{'node': 'commands.start', 'description': 'Start a cleaning process', 'action': 'start', 'role': 'button.start', 'type': 'boolean'},
	{'node': 'commands.stop', 'description': 'Stop the current cleaning process', 'action': 'stop', 'role': 'button.stop', 'type': 'boolean'},
	{'node': 'commands.pause', 'description': 'Pause the current cleaning process', 'action': 'pause', 'role': 'button.pause', 'type': 'boolean'},
	{'node': 'commands.resume', 'description': 'Resume the current cleaning process', 'action': 'resume', 'role': 'button.resume', 'type': 'boolean'},
	{'node': 'commands.dock', 'description': 'Send the robot to the docking station', 'action': 'dock', 'role': 'button', 'type': 'boolean'},
	
	// commands - last command
	{'node': 'commands.last.command', 'description': 'Last command sent to robot', 'preference': 'lastCommand.command', 'role': 'text'},
	{'node': 'commands.last.timestamp', 'description': 'Timestamp last command was sent', 'preference': 'lastCommand.time', 'role': 'value'},
	{'node': 'commands.last.dateTime', 'description': 'DateTime last command was sent', 'preference': 'lastCommand.time', 'kind': 'datetime', 'role': 'text'},
	{'node': 'commands.last.initiator', 'description': 'Initiator of last command', 'preference': 'lastCommand.initiator', 'role': 'text'},
	
	// missions
	{'node': 'missions', 'description': 'Mission information', 'role': 'channel'},
	{'node': 'missions.history', 'description': 'History of all missions', 'role': 'json'},
	
	// missions - current
	{'node': 'missions.current', 'description': 'Mission information about current running mission', 'role': 'channel'},
	{'node': 'missions.current.mapImage', 'description': 'Image of the map of current mission', 'role': 'text'},
	{'node': 'missions.current.mapHTML', 'description': 'HTML for the map of current mission', 'role': 'text'},
	{'node': 'missions.current.path', 'description': 'Path of current mission', 'role': 'text'},
	{'node': 'missions.current.id', 'description': 'ID of current mission', 'role': 'text'},
	
	{'node': 'missions.current.started', 'description': 'Timestamp when the current mission has started', 'role': 'value'},
	{'node': 'missions.current.startedDateTime', 'description': 'DateTime when the current mission has started', 'role': 'text'},
	{'node': 'missions.current.runtime', 'description': 'Runtime in seconds of the current mission', 'role': 'value'},
	
	{'node': 'missions.current.initiator', 'description': 'Initiator of current mission', 'role': 'text'},
	{'node': 'missions.current.cycle', 'description': 'Cycle mode of current mission', 'role': 'text'},
	{'node': 'missions.current.phase', 'description': 'Phase of current mission', 'role': 'text'},
	{'node': 'missions.current.error', 'description': 'Indicates an error during last mission', 'preference': 'cleanMissionStatus.error', 'role': 'state', 'type': 'boolean'},
	{'node': 'missions.current.sqm', 'description': 'Clean square-meters of current mission', 'role': 'text'},
	
	
	// missions.history (+ finished & finishedDateTime)
	
	
	// missions - schedule
	{'node': 'missions.schedule', 'description': 'Schedule of the cleaning process', 'role': 'channel'},
	{'node': 'missions.schedule.cycle', 'description': 'Schedule cycle (Sunday to Saturday)', 'preference': 'cleanSchedule.cycle', 'role': 'text'},
	{'node': 'missions.schedule.hours', 'description': 'Hour to start cycle (Sunday to Saturday)', 'preference': 'cleanSchedule.h', 'role': 'text'},
	{'node': 'missions.schedule.minutes', 'description': 'Minute to start cycle (Sunday to Saturday)', 'preference': 'cleanSchedule.m', 'role': 'text'},
	
	// device
	{'node': 'device', 'description': 'Device information', 'role': 'channel'},
	{'node': 'device.mac', 'description': 'Mac address of the robot', 'preference': 'mac', 'role': 'info.mac'},
	{'node': 'device.name', 'description': 'Name of the robot', 'preference': 'name', 'role': 'info.name'},
	{'node': 'device.type', 'description': 'Type of the robot', 'preference': 'sku', 'role': 'text'},
	
	// device - network
	{'node': 'device.network', 'description': 'Network settings', 'role': 'channel'},
	{'node': 'device.network.dhcp', 'description': 'State whether DHCP is activated', 'preference': 'netinfo.dhcp'},
	{'node': 'device.network.router', 'description': 'Mac address of router', 'preference': 'netinfo.bssid', 'role': 'text'},
	{'node': 'device.network.ip', 'description': 'IP address', 'preference': 'netinfo.addr', 'exception': '0.0.0.0', 'kind': 'ip', 'role': 'info.ip'},
	{'node': 'device.network.subnet', 'description': 'Subnet adress', 'preference': 'netinfo.mask', 'exception': '0.0.0.0', 'kind': 'ip', 'role': 'info.ip'},
	{'node': 'device.network.gateway', 'description': 'Gateway address', 'preference': 'netinfo.gw', 'exception': '0.0.0.0', 'kind': 'ip', 'role': 'info.ip'},
	{'node': 'device.network.dns1', 'description': 'Primary DNS address', 'preference': 'netinfo.dns1', 'exception': '0.0.0.0', 'kind': 'ip', 'role': 'info.ip'},
	{'node': 'device.network.dns2', 'description': 'Secondary DNS address', 'preference': 'netinfo.dns2', 'exception': '0.0.0.0', 'kind': 'ip', 'role': 'info.ip'},
	
	// device - versions
	{'node': 'device.versions', 'description': 'Hardware and softare versions', 'role': 'channel'},
	{'node': 'device.versions.hardwareRev', 'description': 'Hardware Revision', 'preference': 'hardwareRev', 'role': 'text'},
	{'node': 'device.versions.batteryType', 'description': 'Battery Type', 'preference': 'batteryType', 'role': 'text'},
	{'node': 'device.versions.soundVer', 'description': '', 'preference': 'soundVer', 'role': 'text'},
	{'node': 'device.versions.uiSwVer', 'description': '', 'preference': 'uiSwVer', 'role': 'text'},
	{'node': 'device.versions.navSwVer', 'description': '', 'preference': 'navSwVer', 'role': 'text'},
	{'node': 'device.versions.wifiSwVer', 'description': '', 'preference': 'wifiSwVer', 'role': 'text'},
	{'node': 'device.versions.mobilityVer', 'description': '', 'preference': 'mobilityVer', 'role': 'text'},
	{'node': 'device.versions.bootloaderVer', 'description': 'Bootloader Version', 'preference': 'bootloaderVer', 'role': 'text'},
	{'node': 'device.versions.umiVer', 'description': '', 'preference': 'umiVer', 'role': 'text'},
	{'node': 'device.versions.softwareVer', 'description': 'Software Version', 'preference': 'softwareVer', 'role': 'text'},
	
	// preferences
	{'node': 'device.preferences', 'description': 'Preferences', 'role': 'channel'},
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
	{'node': 'states', 'description': 'Status information', 'role': 'channel'},
	{'node': 'states.battery', 'description': 'Battery level of the robot', 'preference': 'batPct', 'role': 'value'},
	{'node': 'states.docked', 'description': 'State whether robot is docked', 'preference': 'dock.known', 'role': 'state', 'type': 'boolean'},
	{'node': 'states.binInserted', 'description': 'State whether bin is inserted', 'preference': 'bin.present', 'role': 'state', 'type': 'boolean'},
	{'node': 'states.binFull', 'description': 'State whether bin status is full', 'preference': 'bin.full', 'role': 'state', 'type': 'boolean'},
	{'node': 'states.status', 'description': 'Current status of the robot', 'preference': 'cleanMissionStatus.phase', 'role': 'text'},
	{'node': 'states.signal', 'description': 'Signal strength', 'preference': 'signal.snr', 'role': 'value'},
	
	// statistics
	{'node': 'statistics', 'description': 'Statistics', 'role': 'channel'},
	
	// statistics - missions
	{'node': 'statistics.time', 'description': 'Time based Statistics', 'role': 'channel'},
	{'node': 'statistics.time.avgMin', 'description': '', 'preference': 'bbchg3.avgMin', 'role': 'value'},
	{'node': 'statistics.time.hOnDock', 'description': '', 'preference': 'bbchg3.hOnDock', 'role': 'value'},
	{'node': 'statistics.time.nAvail', 'description': '', 'preference': 'bbchg3.nAvail', 'role': 'value'},
	{'node': 'statistics.time.estCap', 'description': '', 'preference': 'bbchg3.estCap', 'role': 'value'},
	{'node': 'statistics.time.nLithChrg', 'description': '', 'preference': 'bbchg3.nLithChrg', 'role': 'value'},
	{'node': 'statistics.time.nNimhChrg', 'description': '', 'preference': 'bbchg3.nNimhChrg', 'role': 'value'},
	{'node': 'statistics.time.nDocks', 'description': '', 'preference': 'bbchg3.nDocks', 'role': 'value'},
	
	// statistics - missions
	{'node': 'statistics.missions', 'description': 'Mission based Statistics', 'role': 'channel'},
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
        adapter.log.info('Adapter stopped und unloaded.');
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
	// set encryption key
	if (adapter.config.encryptionKey === undefined || adapter.config.encryptionKey === '')
	{
		var key = encryptor.getEncryptionKey();
		adapter.getForeignObject('system.adapter.roomba.0', function(err, obj)
		{
			obj.native.encryptionKey = key;
			adapter.setForeignObject(obj._id, obj);
		});
		
		adapter.log.debug('Generated new encryption key for password encryption.');
		return;
	}
	else
		var key = adapter.config.encryptionKey;
	
	// check if settings are set
	if (!adapter.config.username || !adapter.config.password || !adapter.config.ip)
	{
		adapter.log.warn('Username, password and / or ip address missing!');
		return;
	}
	
	// decrypt password
	var decrypted = encryptor.decrypt(key, adapter.config.password);
	if (decrypted === false)
	{
		adapter.log.warn('Decrypting password failed!');
		return;
	}
	
	// connect to Roomba
	try
	{
		robot = new Roomba.Local(adapter.config.username, decrypted, adapter.config.ip); // username, password, ip
	}
	catch(err)
	{
		adapter.log.warn(err.message); // this will not be trigged due to an issue in dorita980 library (see https://github.com/koalazak/dorita980/issues/75)
	}
	
	// check if connection is successful
	var nodeConnected = {'node': 'states._connected', 'description': 'Connection state'};
	
	/*
	 * ROBOT ERROR
	 */
	robot.on('error', function(err)
	{
		adapter.log.warn(err.message);
		
		connected = false;
		library.set(nodeConnected, connected);
		robot.end();
	});
	 
	/*
	 * ROBOT CONNECT
	 */
	robot.on('connect', function()
	{
		adapter.log.info('Roomba online. Connection established.');
		
		connected = true;
		library.set(nodeConnected, connected);
	});
	
	/*
	 * ROBOT CLOSE
	 */
	robot.on('close', function(res)
	{
		//adapter.log.debug('Roomba Connection closed.');
		
		connected = false;
		library.set(nodeConnected, connected);
		robot.end();
	});
	
	/*
	 * ROBOT OFFLINE
	 */
	robot.on('offline', function(res)
	{
		adapter.log.info('Connection lost. Roomba offline.');
		
		connected = false;
		library.set(nodeConnected, connected);
		robot.end();
	});
	
	/*
	 * ROBOT MISSION
	 */
	mission = null;
	pathColor = adapter.config.pathColor || '#f00';
	icons = {roomba: getImage(__dirname + '/img/roomba.png'), home: getImage(__dirname + '/img/home.png')};
	
	robot.on('mission', function(res)
	{
		if (res.cleanMissionStatus.phase !== 'stop' && res.cleanMissionStatus.phase !== 'charge' && res.cleanMissionStatus.phase !== 'stuck')
			mapMission(res);
		
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
		if (connected)
			robot[action]();
		else
			adapter.log.warn('Roomba not online! Action not triggered.');
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
		case 'getStates':
			var states = Array.isArray(msg.message.states) ? msg.message.states : [];
			states.forEach(function(state)
			{
				adapter.getState(state, function(err, res)
				{
					library.msg(msg.from, msg.command, err || !res ? {result: false, error: err.message} : {result: true, state: res}, msg.callback);
				});
			});
			break;
			
		case 'encrypt':
			adapter.log.debug('Encrypted message.');
			library.msg(msg.from, msg.command, {result: true, data: {password: encryptor.encrypt(adapter.config.encryptionKey, msg.message.cleartext)}}, msg.callback);
			break;
			
		case 'decrypt':
			adapter.log.debug('Decrypted message.');
			library.msg(msg.from, msg.command, {result: true, data: {cleartext: encryptor.decrypt(adapter.config.encryptionKey, msg.message.password)}}, msg.callback);
			break;
			
		case 'getIp':
			Roomba.getRobotIP(function(err, ip)
			{
				adapter.log.debug('Retrieved IP address: ' + ip);
				library.msg(msg.from, msg.command, err ? {result: false, error: err.message} : {result: true, data: {ip: ip}}, msg.callback);
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
			msg.message.encryption = msg.message.encryption === undefined ? true : msg.message.encryption;
			getPassword(msg.message.ip, function(res)
			{
				adapter.log.debug(res.result === true ? 'Successfully retrieved password.' : 'Failed retrieving password.');
				if (msg.message.encryption && res.result === true) res.data.password = encryptor.encrypt(adapter.config.encryptionKey, res.data.password);
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
				adapter.log.debug('Extracted password.');
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
	var states = ['cleanMissionStatus', 'cleanSchedule', 'name', 'vacHigh', 'bbchg3', 'signal'];
	
	
	var tmp, preference, index;
	robot.getRobotState(states).then((preferences) =>
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
				else if (node.preference !== undefined)
				{
					tmp = Object.assign({}, preferences);
					preference = node.preference;
					
					// go through preferences
					while (preference.indexOf('.') > -1)
					{
						try
						{
							index = preference.substr(0, preference.indexOf('.'));
							preference = preference.substr(preference.indexOf('.')+1);
							tmp = tmp[index];
						}
						catch(err) {adapter.log.debug(err.message);}
					}
					
					// check value
					if (tmp[preference] === 'aN.aN.NaN aN:aN:aN')
						return;
					
					// convert value
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
					
					// write value
					if (node.exception === undefined || tmp[preference] !== node.exception) // only write value if not defined as exceptional
						library.set(node, node.type === 'boolean' && Number.isInteger(tmp[preference]) ? (tmp[preference] === 1) : tmp[preference]);
				}
				
				// only state creation
				else
				{
					adapter.getState(node.node, function(err, res)
					{
						if ((err !== null || !res) && (node.node !== undefined && node.description !== undefined))
							library.set(node, '');
					});
				}
				
			}
			catch(err) {adapter.log.error(JSON.stringify(err.message))}
		});
	});
	
	library.set({'node': 'refreshedTimestamp', 'description': 'Timestamp of last update', 'role': 'value'}, Math.floor(Date.now()/1000));
	library.set({'node': 'refreshedDateTime', 'description': 'DateTime of last update', 'role': 'text'}, library.getDateTime(Date.now()));
};


/**
 * Map mission.
 *
 */
function mapMission(res)
{
	// create new map once mission starts
	if (mission === null || mission.id !== res.cleanMissionStatus.nMssn)
	{
		adapter.log.info('Roomba has started a new mission.');
		mission = {id: res.cleanMissionStatus.nMssn, status: {}, pos: {}, path: []};
		library._setValue('missions.current.id', mission.id);
		
		// started
		started = Math.floor(Date.now()/1000);
		library._setValue('missions.current.started', started);
		library._setValue('missions.current.startedDateTime', library.getDateTime(Date.now()));
		
		// create canvas for map
		canvas = createCanvas(mapSize.width, mapSize.height);
		map = canvas.getContext('2d');
		map.beginPath();
		
		// place home icon
		map.drawImage(icons.home.canvas, mapCenter.h + res.pose.point.x - icons.home.width/2, mapCenter.v + res.pose.point.y - icons.home.height/2, icons.home.width, icons.home.height);
	}
	else
		mission.pos.last = {theta: mission.pos.current.theta, x: mission.pos.current.x, y: mission.pos.current.y};
	
	// add information to payload
	mission.status = Object.assign({}, res.cleanMissionStatus, {sqm: parseFloat((res.cleanMissionStatus.sqft / 10.764).toFixed(2))});
	mission.pos.current = {theta: 180-res.pose.theta, x: mapCenter.h + res.pose.point.x, y: mapCenter.v + res.pose.point.y};
	mission.path.push(mission.pos.current);
	
	// draw position on map
	try
	{
		// robot just started
		if (mission.pos.last === undefined)
			map.fillRect(mission.pos.current.x, mission.pos.current.y, 1, 1);
		
		// robot moving
		else
		{
			map.lineWidth = 2;
			map.strokeStyle = pathColor;
			map.moveTo(mission.pos.last.x, mission.pos.last.y);
			map.lineTo(mission.pos.current.x, mission.pos.current.y);
			map.stroke();
		}
		
		// copy map
		image = createCanvas(canvas.width, canvas.height);
		img = image.getContext('2d');
		img.drawImage(canvas, 0, 0);
		
		// add robot to copied map
		img.drawImage(rotateImage(icons.roomba.canvas, mission.pos.current.theta), mission.pos.current.x - icons.roomba.width/2, mission.pos.current.y - icons.roomba.height/2, icons.roomba.width, icons.roomba.height);
		
		// save map and path
		library._setValue('missions.current.mapImage', image.toDataURL());
		library._setValue('missions.current.mapHTML', '<img src="' + image.toDataURL() + '" /style="width:100%;">');
		library._setValue('missions.current.path', JSON.stringify(mission.path));
		
		// additional mission status information
		library._setValue('missions.current.runtime', Math.floor(Date.now()/1000) - started);
		library._setValue('missions.current.sqm', mission.status.sqm);
		library._setValue('missions.current.cycle', mission.status.cycle);
		library._setValue('missions.current.phase', mission.status.phase);
		library._setValue('missions.current.error', mission.status.error);
		library._setValue('missions.current.initiator', mission.status.initiator);
	}
	catch(e) {
		adapter.log.warn(e.message);
	}
}


/**
 * Retrieve image data from file.
 *
 */
function getImage(path)
{
	// read as image
	var img = new Image();
	img.src = fs.readFileSync(path);
	
	// read as canvas
	var canvas = createCanvas(img.width, img.height);
	var ctx = canvas.getContext('2d');
	ctx.drawImage(img, 0, 0);
	
	return {
		img: img,
		canvas: canvas,
		width: img.width,
		height: img.height
	};
}


/**
 * Rotate a canvas around its mapCenter.
 * @see https://www.mediaevent.de/javascript/canvas-rotate.html
 *
 */
function rotateImage(img, radiant)
{
	var canvas = createCanvas(img.width, img.height);
	var ctx = canvas.getContext('2d');
	
	ctx.clearRect(0, 0, img.width, img.height); // clear the canvas
	ctx.translate(img.width/2, img.width/2); // move registration point to the center of the canvas
	ctx.rotate(radiant * Math.PI / 180);
	ctx.translate(-img.width/2, -img.width/2); // Move registration point back to the top left corner of canvas
	ctx.drawImage(img, 0, 0);
	
	return canvas;
}