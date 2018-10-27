var dorita980 = require('dorita980');

/**
 * 
 *
 *
 */
module.exports = class Roomba
{
	/**
	 *
	 *
	 */
    constructor(connection, adapter)
	{
		// initialise variables
		this.adapter = adapter;
		this.preferences = {};
		
		// initialise connection
		adapter.log.debug('Initialise connection to Roomba...');
		try
		{
			this.robot = new dorita980.Local(connection.username, connection.password, connection.ip); // username, password, ip
		}
		catch(e)
		{
			adapter.log.warn('Roomba connection failed!');
		}
		
		// listen to events
		this.registerEvents();
    }
	
	/**
	 * Update preferences.
	 *
	 */
	updPreferences(callback)
	{
		this.robot.getPreferences().then((preferences) => {
			this.adapter.log.debug('Refreshed Roomba preferences.');
			this.preferences = preferences;
			callback();
		});
	}
	
	/**
	 * Retrieve a state from preferences.
	 *
	 */
	get(state)
	{
		this.adapter.log.debug(Object.keys(this.preferences));
		
		if (state.indexOf('.') > -1)
		{
			//get()
		}
		else
			return Object.keys(this.preferences);
	}
	
	/**
	 * Actions
	 *
	 */
	action(action)
	{
		switch(action)
		{
			case 'start': this.start(); break;
			case 'stop': this.stop(); break;
			case 'pause': this.pause(); break;
			case 'resume': this.resume(); break;
			case 'dock': this.dock(); break;
		}
	}
	
	start() {this.robot.start()}
	stop() {this.robot.stop()}
	pause() {this.robot.pause()}
	resume() {this.robot.resume()}
	dock() {this.robot.dock()}
	
	/**
	 * Events
	 *
	 */
    registerEvents()
	{
		var self = this;
		
		/*
		 * EVENTS: CONNECT
		 */
		this.robot.on('connect', function()
		{
			self.adapter.log.info('Roomba connected!');
		});

		/*
		 * EVENTS: DISCONNECT / CLOSE
		 */
		this.robot.on('close', function()
		{
			self.adapter.log.info('Roomba disconnected!');
		});

		/*
		 * EVENTS: OFFLINE
		 */
		this.robot.on('offline', function()
		{
			self.adapter.log.info('Roomba offline!');
		});

		/*
		 * EVENTS: STATE CHANGES
		 */
		this.robot.on('state', function(data)
		{
			//self.adapter.log.debug('State has changed!');
			//self.adapter.log.debug(JSON.stringify(data));
		});
    }
}
