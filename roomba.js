'use strict';
const adapterName = require('./io-package.json').common.name;
const utils = require('@iobroker/adapter-core'); // Get common adapter utils

let _fs = require('fs');
let _dgram = require('dgram');
let _tls = require('tls');
let _http = require('http');
let _request = require('request');
let _dorita980 = require('dorita980');
let _canvas;


/*
 * internal libraries
 */
const Library = require(__dirname + '/lib/library.js');
//const Encryption = require(__dirname + '/lib/encryption.js');
const _NODES = require(__dirname + '/_NODES.js');


/*
 * variables initiation
 */
let Image, Canvas, createCanvas;
let adapter;
let library;
//let encryptor = new Encryption(adapter);
let closed, unloaded;
let refreshCycle;

let _installed = false;
let _updating = false;

let robot, connected, mission, previous, icons, pathColor;
let started, endLoop;
let canvas, canvasTmp, map, mapTmp, image, img;

let mapSize = {width: 200, height: 200};
let nPos = {x: 0, y: 0};
let mapCenter = {h: Math.round(mapSize.width/2), v: Math.round(mapSize.height/2)};
let offset = 10;

let listeners = {};
let actions = ['start', 'stop', 'pause', 'resume', 'dock']; // states that trigger actions
const nodeConnected = {'node': 'states._connected', 'description': 'Connection state'};


/*
 * ADAPTER
 *
 */
function startAdapter(options)
{
	options = options || {};
	Object.assign(options,
	{
		name: adapterName
	});
	
	adapter = new utils.Adapter(options);
	library = new Library(adapter, { updatesInLog: false });
	unloaded = false;
	
	/*
	 * ADAPTER READY
	 *
	 */
	adapter.on('ready', main);
	
	/*
	 * ADAPTER UNLOAD
	 *
	 */
	adapter.on('unload', function(callback)
	{
		try
		{
			adapter.log.info('Adapter stopped und unloaded.');
			
			unloaded = true;
			clearTimeout(refreshCycle);
			disconnect();
			
			callback();
		}
		catch(e)
		{
			callback();
		}
	});
	
	/*
	 * STATE CHANGE
	 *
	 */
	adapter.on('stateChange', function(node, state)
	{
		//adapter.log.debug('State of ' + node + ' has changed ' + JSON.stringify(state) + '.');
		let action = node.substr(node.lastIndexOf('.')+1);
		
		// action on Roomba
		if (actions.indexOf(action) > -1 && state.ack !== true)
		{
			adapter.log.info('Triggered action -' + action + '- on Roomba.');
			if (connected)
			{
				if (action == 'dock') robot.stop();
				robot[action]();
			}
			else
				adapter.log.warn('Roomba not online! Action not triggered.');
		}
		
		// end mission
		if (action == '_endMission' && state.ack !== true)
		{
			adapter.log.info('Triggered to end the current mission.');
			if (mission != null)
				endMission(mission);
			else
				adapter.log.warn('Could not save mission.');
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
			case 'command':
				// https://github.com/koalazak/dorita980/issues/39
				let command = msg.message.command;
				adapter.log.debug('Sent command: ' + command + '!)');
				
				robot.publish('cmd', JSON.stringify({command: command, time: Date.now() / 1000 | 0, initiator: 'ioBroker.roomba'}), function(err, res)
				{
					if (err)
						adapter.log.warn(JSON.stringify(err));

					else
						adapter.log.debug(JSON.stringify(res));
				});
				break;
		
			case 'getStates':
				let states = Array.isArray(msg.message.states) ? msg.message.states : [];
				states.forEach(function(state)
				{
					adapter.getState(state, function(err, res)
					{
						library.msg(msg.from, msg.command, err || !res ? {result: false, error: err.message} : {result: true, state: res}, msg.callback);
					});
				});
				break;
			
			/*
			case 'encrypt':
				adapter.log.debug('Encrypted message.');
				library.msg(msg.from, msg.command, {result: true, data: {password: encryptor.encrypt(adapter.config.encryptionKey, msg.message.cleartext)}}, msg.callback);
				break;
				
			case 'decrypt':
				adapter.log.debug('Decrypted message.');
				library.msg(msg.from, msg.command, {result: true, data: {cleartext: encryptor.decrypt(adapter.config.encryptionKey, msg.message.password)}}, msg.callback);
				break;
			*/
			
			case 'getIp':
				_dorita980.getRobotIP(function(err, ip)
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
					//if (msg.message.encryption && res.result === true) res.data.password = encryptor.encrypt(adapter.config.encryptionKey, res.data.password);
					library.msg(msg.from, msg.command, res, msg.callback);
				});
				break;
		}
	});
	
	return adapter;	
};


/**
 *
 *
 */
function main()
{
	// check for canvas
	try
	{
		_canvas = require('canvas');
		_installed = true;
		
		Canvas = _canvas.Canvas;
		Image = _canvas.Image;
		createCanvas = _canvas.createCanvas;
	}
	catch(e)
	{
		adapter.log.warn('Canvas not installed! Thus, no map drawings are possible.');
		adapter.log.debug(e.message);
	}
	
	// set encryption key
	/*
	if (adapter.config.encryptionKey === undefined || adapter.config.encryptionKey === '')
	{
		let key = encryptor.getEncryptionKey();
		adapter.getForeignObject('system.adapter.roomba.0', function(err, obj)
		{
			obj.native.encryptionKey = key;
			adapter.setForeignObject(obj._id, obj);
		});
		
		adapter.log.debug('Generated new encryption key for password encryption.');
		return;
	}
	else
		let key = adapter.config.encryptionKey;
	*/
	
	// check if settings are set
	if (!adapter.config.username || !adapter.config.password || !adapter.config.ip)
	{
		//return library.terminate('Username, password and / or ip address missing!'); // will kill message-box
		adapter.log.error('Username, password and / or ip address missing!');
		return;
	}
	
	// decrypt password
	/*
	let decrypted = encryptor.decrypt(key, adapter.config.password);
	if (decrypted === false)
	{
		adapter.log.warn('Decrypting password failed!');
		return;
	}
	*/
	
	// connect to Roomba
	robot = connect(adapter.config.username, adapter.config.password, adapter.config.ip); // connect(adapter.config.username, decrypted, adapter.config.ip);
	
	/*
	 * ROBOT CONNECT
	 */
	robot.on('connect', function()
	{
		adapter.log.info('Roomba online. Connection established.');
		
		closed = false;
		connected = true;
		library.set(nodeConnected, connected);
	});
	
	/*
	 * ROBOT STATE UPDATE
	 */
	robot.on('state', function(preferences)
	{
		updPreferences(preferences);
	});
	
	/*
	 * ROBOT ERROR
	 */
	robot.on('error', function(err)
	{
		adapter.log.error(err.message);
		disconnect();
	});
	
	/*
	 * ROBOT CLOSE
	 */
	robot.on('close', function(res)
	{
		if (closed) return;
		closed = true;
		
		adapter.log.info('Roomba Connection closed.');
		
		if (res && res.errno == 'ECONNREFUSED')
			adapter.log.warn('Connection to Roomba refused. Please close all other connections to the Roomba, e.g. Smartphone Apps!');
		
		else if (res && res.errno == 'EPROTO')
			adapter.log.warn('Secure Connection to Roomba failed!');
		
		else if (res && res.errno == 'EPIPE')
			;//adapter.log.warn('Secure Connection to Roomba failed!');
		
		else
			adapter.log.warn('Unknown error! Please see debug log for details.');
		
		adapter.log.debug(JSON.stringify(res));
		disconnect();
	});
	
	/*
	 * ROBOT OFFLINE
	 */
	robot.on('offline', function(res)
	{
		adapter.log.warn('Connection lost! Roomba offline.');
		disconnect();
	});
	
	/*
	 * ROBOT MISSION
	 */
	mission = null;
	endLoop = 0;
	pathColor = adapter.config.pathColor || '#f00';
	
	if (_installed)
	{
		icons = {roomba: getImage(__dirname + '/img/roomba.png'), home: getImage(__dirname + '/img/home.png')};
		offset = icons.roomba.width;
		
		adapter.getState('missions.current._data', function(err, state)
		{
			// restore last session
			if (state !== null && state.val !== '')
			{
				mission = JSON.parse(state.val);
				adapter.log.info('Restored last mission (#' + mission.id + ').');
				adapter.log.debug('Restored mission: ' + state.val);
				mission.restored = true;
			}
			
			// robot mission
			robot.on('mission', function(res)
			{
				if (adapter.config.debug)
					adapter.log.debug('DEBUG MISSION DATA: ' + JSON.stringify(res));
				
				// interrupt if no position is given
				if (res.pose === null || res.pose === undefined) return;
				res.cleanMissionStatus.phase = getCleaningPhase(res.cleanMissionStatus.phase);
				
				// map mission
				if (['stop', 'charge', 'stuck'].indexOf(res.cleanMissionStatus.phase) === -1)
					mapMission(res);
				
				// end mission after a while, if 'hmPostMsn' was not received
				else if (mission !== null && mission.time !== undefined && mission.time.ended === undefined && endLoop <= 1000)
					endLoop++;
				
				else if (mission !== null && mission.time !== undefined && mission.time.ended === undefined && endLoop > 1000)
				{
					endMission(mission);
					endLoop = 0;
				}
			});
		});
	}
}


/**
 * Translate current cleaning process.
 *
 * @param	{string}	process		Current process as received from robot
 * @return	{string}				Translation
 *
 */
function getCleaningPhase(process)
{
	switch(process)
	{
		case 'hmUsrDock': return 'docking';
		case 'hmPostMsn': return 'finished';
		default: return process;
	}
}


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
	let client = _tls.connect(8883, ip, { rejectUnauthorized: false, ciphers: 'AES128-SHA256' });
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
		let sliceFrom = 13;
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
	const server = _dgram.createSocket('udp4');
	
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
 * Connect to Roomba.
 *
 */
function connect(user, password, ip)
{
	adapter.log.info('Connecting to Roomba (' + ip + ')..');
	try
	{
		return new _dorita980.Local(user, password, ip);
	}
	catch(err)
	{
		adapter.log.warn(err.message); // this will not be trigged due to an issue in dorita980 library (see https://github.com/koalazak/dorita980/issues/75 )
	}
}

/**
 * Update preferences.
 *
 * @param	{object}	preferences		Received preferences from robot
 * @return	{boolean}					Indication whether preferences have been updated
 *
 */
function updPreferences(preferences)
{
	if (_updating)
		return false;
	
	adapter.log.debug('Retrieved preferences: ' + JSON.stringify(preferences));
	_updating = true;
	
	// save raw preferences
	library.set({'node': 'device._rawData', 'description': 'Raw preferences data as json', 'role': 'json'}, JSON.stringify(preferences));
	
	// update states
	let tmp, preference, index;
	_NODES.forEach(function(node)
	{
		try
		{
			// action
			if (node.action !== undefined && listeners[node.node] === undefined)
			{
				adapter.log.debug('Subscribed to states ' + node.node + '.');
				library.set(node, false);
				adapter.subscribeStates(node.node); // attach state listener
				listeners[node.node] = node;
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
				if (tmp === undefined || tmp[preference] === undefined || tmp[preference] === 'aN.aN.NaN aN:aN:aN')
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
	
	library.set({'node': 'refreshedTimestamp', 'description': 'Timestamp of last update', 'role': 'value'}, Math.floor(Date.now()/1000));
	library.set({'node': 'refreshedDateTime', 'description': 'DateTime of last update', 'role': 'text'}, library.getDateTime(Date.now()));
	
	// refresh
	if (adapter.config.refresh === undefined || adapter.config.refresh === null)
		adapter.config.refresh = 0;
	
	else if (adapter.config.refresh > 0 && adapter.config.refresh < 10)
	{
		adapter.log.warn('Due to performance reasons, the refresh rate can not be set to less than 10 seconds. Using 10 seconds now.');
		adapter.config.refresh = 10;
	}
	
	if (adapter.config.refresh > 0 && !unloaded)
		refreshCycle = setTimeout(function() {_updating = false}, Math.round(parseInt(adapter.config.refresh)*1000));
	
	return true;
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
		mission = {id: res.cleanMissionStatus.nMssn, restored: false, home: false, time: {}, status: {}, pos: {}, map: {}, path: []};
		adapter.log.info('Roomba has started a new mission (#' + mission.id + ').');
		
		library._setValue('missions.current.id', mission.id);
		
		// started
		mission.time.started = Math.floor(Date.now()/1000);
		mission.time.startedDateTime = library.getDateTime(mission.time.started*1000);
		library._setValue('missions.current.started', mission.time.started);
		library._setValue('missions.current.startedDateTime', mission.time.startedDateTime);
		
		// reset ended
		library._setValue('missions.current.ended', '');
		library._setValue('missions.current.endedDateTime', '');
		
		// create canvas for map
		canvas = createCanvas(mapSize.width, mapSize.height);
		map = canvas.getContext('2d');
		map.beginPath();
	}
	
	// restore last session
	else if (mission !== null && mission.id === res.cleanMissionStatus.nMssn && mission.time.ended === undefined && (canvas === undefined || !canvas))
	{
		adapter.log.info('Roomba has resumed a previous mission (#' + mission.id + ').');
		mission.pos = {
			last: {theta: mission.pos.current.theta, x: mission.pos.current.x, y: mission.pos.current.y}
		};
		
		// create canvas for map
		previous = getImage(mission.map.img);
		canvas = previous.canvas;
		map = previous.ctx;
		map.beginPath();
	}
	
	//
	else
		mission.pos.last = {theta: mission.pos.current.theta, x: mission.pos.current.x, y: mission.pos.current.y};
	
	// add information to payload
	mission.status = Object.assign({}, res.cleanMissionStatus, {sqm: parseFloat((res.cleanMissionStatus.sqft / 10.764).toFixed(2))});
	mission.pos.current = {theta: 180-res.pose.theta, x: mapCenter.h + res.pose.point.x + nPos.x, y: mapCenter.v - res.pose.point.y + nPos.y};
	
	// place home icon
	if (mission.pos && mission.pos.last && mission.pos.last.x && !mission.home)
	{
		map.drawImage(icons.home.canvas, mapCenter.h + mission.pos.current.x - icons.home.width/2, mapCenter.v + mission.pos.current.y - icons.home.height/2, icons.home.width, icons.home.height);
		mission.home = true;
	}
	
	// draw position on map
	try
	{
		// resize image if robot moves outside
		if (mission.pos.current.x < offset || mission.pos.current.y < offset || mission.pos.current.x > mapSize.width-offset || mission.pos.current.y > mapSize.height-offset)
		{
			let nSize = {width: mapSize.width, height: mapSize.height};
			let d = {x: 0, y: 0};
			
			if (mission.pos.current.x > mapSize.width-offset) {nSize.width += 100}
			if (mission.pos.current.y > mapSize.height-offset) {nSize.height += 100}
			if (mission.pos.current.x < offset) {nSize.width += 100; d.x = 100; nPos.x += 100; mission.pos.last.x += d.x; mission.pos.current.x += d.x}
			if (mission.pos.current.y < offset) {nSize.height += 100; d.y = 100; nPos.y += 100; mission.pos.last.y += d.y; mission.pos.current.y += d.y}
			
			// resize map
			canvasTmp = createCanvas(nSize.width, nSize.height);
			mapTmp = canvasTmp.getContext('2d');
			mapTmp.drawImage(canvas, d.x, d.y);
			
			// remap canvas and set new size
			canvas = canvasTmp;
			map = mapTmp;
			mapSize = {width: nSize.width, height: nSize.height};
		}
		
		// robot just started
		if (mission.pos.last === undefined)
		{
			map.fillStyle = pathColor;
			map.fillRect(mission.pos.current.x, mission.pos.current.y, 1, 1);
		}
		
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
		mission.map = {img: image.toDataURL(), size: mapSize};
	}
	catch(e) {adapter.log.warn(e.message)}
	
	
	// add to path
	mission.path.push(mission.pos.current);
	
	// save map and path
	library._setValue('missions.current.mapImage', mission.map.img);
	library._setValue('missions.current.mapHTML', '<img src="' + mission.map.img + '" /style="width:100%;">');
	library._setValue('missions.current.mapSize', JSON.stringify(mission.map.size));
	library._setValue('missions.current.path', JSON.stringify(mission.path));
	
	// additional mission status information
	mission.time.runtime = Math.floor(Date.now()/1000) - mission.time.started;
	library._setValue('missions.current.runtime', mission.time.runtime);
	library._setValue('missions.current.sqm', mission.status.sqm);
	library._setValue('missions.current.cycle', mission.status.cycle);
	library._setValue('missions.current.error', !!mission.status.error);
	library._setValue('missions.current.initiator', mission.status.initiator);
	library._setValue('missions.current.phase', mission.status.phase);
	
	// save data
	library._setValue('missions.current._data', JSON.stringify(Object.assign(mission, {map: {img: canvas != undefined ? canvas.toDataURL() : '', size: mapSize}})));
}


/**
 * Retrieve image data from file.
 *
 */
function getImage(path)
{
	// read as image
	let img = new Image();
	img.src = path.indexOf('data:image') > -1 && path.indexOf('base64') > -1 ? path : _fs.readFileSync(path);
	
	// read as canvas
	let canvas = createCanvas(img.width, img.height);
	let ctx = canvas.getContext('2d');
	ctx.drawImage(img, 0, 0);
	
	return {
		img: img,
		canvas: canvas,
		ctx: ctx,
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
	let canvas = createCanvas(img.width, img.height);
	let ctx = canvas.getContext('2d');
	
	ctx.clearRect(0, 0, img.width, img.height); // clear the canvas
	ctx.translate(img.width/2, img.width/2); // move registration point to the center of the canvas
	ctx.rotate(radiant * Math.PI / 180);
	ctx.translate(-img.width/2, -img.width/2); // Move registration point back to the top left corner of canvas
	ctx.drawImage(img, 0, 0);
	
	return canvas;
}


/**
 * Ends and saves a mission.
 *
 */
function endMission(mission)
{
	let history = []; 
	
	// get history
	adapter.getState('missions.history', function(err, state)
	{
		history = state != null && state.val != '' ? JSON.parse(state.val) : history;
		
		// add end time
		mission.time.ended = Math.floor(Date.now()/1000);
		mission.time.endedDateTime = library.getDateTime(mission.time.ended*1000);
		library._setValue('missions.current.ended', mission.time.ended);
		library._setValue('missions.current.endedDateTime', mission.time.endedDateTime);
		
		// save data
		library._setValue('missions.current._data', JSON.stringify(mission));
		
		// check for duplicates
		let duplicate = false;
		history.forEach(function(entry, i)
		{
			if (entry.id == mission.id)
			{
				adapter.log.info('Mission has already been saved, but will be overwritten.');
				history[i] = mission;
				duplicate = true;
			}
		});
		
		if (duplicate === false)
		{
			delete mission.path;
			history.push(mission);
		}
		
		// save history
		library._setValue('missions.history', JSON.stringify(history.slice(0, 199))); // only keep 200 entries
		adapter.log.info('Mission #' + mission.id + ' saved.');
		return true;
	});
};


/**
 * Disconnects a Roomba.
 *
 */
function disconnect()
{
	connected = false;
	library.set(nodeConnected, connected);
}


/*
 * COMPACT MODE
 * If started as allInOne/compact mode => return function to create instance
 *
 */
if (module && module.parent)
	module.exports = startAdapter;
else
	startAdapter(); // or start the instance directly
