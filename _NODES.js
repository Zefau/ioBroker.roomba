module.exports =
[
	// commands
	{'node': 'commands', 'description': 'Actions and information of the cleaning process', 'role': 'channel'},
	{'node': 'commands._runCommand', 'description': 'Run any command (see https://bit.ly/2S57cgM)', 'role': 'text', 'type': 'string', 'common': { 'write': true } },
	{'node': 'commands.start', 'description': 'Start a cleaning process', 'action': 'start', 'role': 'button.start', 'type': 'boolean'},
	{'node': 'commands.stop', 'description': 'Stop the current cleaning process', 'action': 'stop', 'role': 'button.stop', 'type': 'boolean'},
	{'node': 'commands.pause', 'description': 'Pause the current cleaning process', 'action': 'pause', 'role': 'button.pause', 'type': 'boolean'},
	{'node': 'commands.resume', 'description': 'Resume the current cleaning process', 'action': 'resume', 'role': 'button.resume', 'type': 'boolean'},
	{'node': 'commands.dock', 'description': 'Send the robot to the docking station', 'action': 'dock', 'role': 'button', 'type': 'boolean'},
	
	// commands - last command
	{'node': 'commands.last', 'description': 'Last processed command', 'role': 'channel'},
	{'node': 'commands.last.command', 'description': 'Last command sent to robot', 'preference': 'lastCommand.command', 'role': 'text'},
	{'node': 'commands.last.timestamp', 'description': 'Timestamp last command was sent', 'preference': 'lastCommand.time', 'kind': 'timestamp', 'role': 'value'},
	{'node': 'commands.last.dateTime', 'description': 'DateTime last command was sent', 'preference': 'lastCommand.time', 'kind': 'datetime', 'role': 'text'},
	{'node': 'commands.last.initiator', 'description': 'Initiator of last command', 'preference': 'lastCommand.initiator', 'role': 'text'},
	
	// missions
	{'node': 'missions', 'description': 'Mission information', 'role': 'channel'},
	{'node': 'missions.history', 'description': 'History of all missions', 'role': 'json'},
	
	// missions - current
	{'node': 'missions.current', 'description': 'Mission information about current running mission', 'role': 'channel'},
	//{'node': 'missions.current._endMission', 'description': 'End mission and save to history', 'action': true, 'role': 'button', 'type': 'boolean'},
	{'node': 'missions.current._data', 'description': 'All data of current mission', 'role': 'json'},
	
	{'node': 'missions.current.mapImage', 'description': 'Image of the map of current mission', 'role': 'text'},
	{'node': 'missions.current.mapHTML', 'description': 'HTML for the map of current mission', 'role': 'text'},
	{'node': 'missions.current.mapSize', 'description': 'Size (in px) of the map', 'role': 'json'},
	{'node': 'missions.current.path', 'description': 'Path of current mission', 'role': 'text'},
	{'node': 'missions.current.id', 'description': 'ID of current mission', 'role': 'text'},
	
	{'node': 'missions.current.started', 'description': 'Timestamp when the current mission has started', 'role': 'value'},
	{'node': 'missions.current.startedDateTime', 'description': 'DateTime when the current mission has started', 'role': 'text'},
	{'node': 'missions.current.ended', 'description': 'Timestamp when the current mission has ended', 'role': 'value'},
	{'node': 'missions.current.endedDateTime', 'description': 'DateTime when the current mission has ended', 'role': 'text'},
	{'node': 'missions.current.runtime', 'description': 'Runtime in seconds of the current mission', 'role': 'value'},
	
	{'node': 'missions.current.initiator', 'description': 'Initiator of current mission', 'role': 'text'},
	{'node': 'missions.current.cycle', 'description': 'Cycle mode of current mission', 'role': 'text'},
	{'node': 'missions.current.phase', 'description': 'Phase of current mission', 'preference': 'cleanMissionStatus.phase', 'role': 'text'},
	{'node': 'missions.current.error', 'description': 'Indicates an error during last mission', 'preference': 'cleanMissionStatus.error', 'role': 'indicator', 'type': 'boolean'},
	{'node': 'missions.current.sqm', 'description': 'Cleaned square-meters of current mission', 'role': 'text'},
	
	// missions - schedule
	{'node': 'missions.schedule', 'description': 'Schedule of the cleaning process', 'role': 'channel'},
	{'node': 'missions.schedule.cycle', 'description': 'Schedule cycle (Sunday to Saturday)', 'preference': 'cleanSchedule.cycle', 'role': 'text', 'common': { 'write': true } },
	{'node': 'missions.schedule.hours', 'description': 'Hour to start cycle (Sunday to Saturday)', 'preference': 'cleanSchedule.h', 'role': 'text', 'common': { 'write': true } },
	{'node': 'missions.schedule.minutes', 'description': 'Minute to start cycle (Sunday to Saturday)', 'preference': 'cleanSchedule.m', 'role': 'text', 'common': { 'write': true } },
	
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
	{'node': 'states.battery', 'description': 'Battery level of the robot', 'preference': 'batPct', 'role': 'value.battery'},
	{'node': 'states.docked', 'description': 'State whether robot is docked', 'preference': 'dock.known', 'role': 'indicator', 'type': 'boolean'},
	{'node': 'states.binInserted', 'description': 'State whether bin is inserted', 'preference': 'bin.present', 'role': 'indicator', 'type': 'boolean'},
	{'node': 'states.binFull', 'description': 'State whether bin status is full', 'preference': 'bin.full', 'role': 'indicator', 'type': 'boolean'},
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