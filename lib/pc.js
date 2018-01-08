var procrastinator = (function() {

	var _enabled = true;
	var _pause = 0;
	var _timecodeControl = 'site'; // or disabled/global
	var _timecodeGlobal = '';
	var _websites = [];
	var _blockUrl = '';

	/**
	 * Constructor
	 */
	(function() {
		_loadState(function() {
			// state has been loaded
			console.info('Procrastorator has booted with state');
		});
	})();

	/**
	 * Get the current timecode control mechanism (site, disabled or global)
	 *
	 * @return string
	 */
	this.getTimecodeControl = function()
	{
		return _timecodeControl;
	}

	/**
	 * Set the current timecode control mechanism
	 */
	this.setTimecodeControl = function(timecodeControl)
	{
		if (timecodeControl !== 'site' && timecodeControl !== 'global' && timecodeControl !== 'disabled') {
			timecodeControl = 'site'
		}
		_timecodeControl = timecodeControl;
		_saveState('timecodeControl');
		return this;
	}

	this.getTimecodeGlobal = function()
	{
		return _timecodeGlobal;
	}

	this.setTimecodeGlobal = function(timecodeGlobal)
	{
		_timecodeGlobal = timecodeGlobal;
		_saveState('timecodeGlobal');
		return this;
	}

	this.isEnabled = function()
	{
		return _enabled;
	}

	this.enabled = function()
	{
		_enabled = true;
		_pause = false;
		_saveState('enabled');
		_saveState('pause');
		return this;
	}

	this.disabled = function()
	{
		_enabled = false;
		_saveState('enabled');
		return this;
	}

	this.setBlockUrl = function(blockUrl)
	{
		_blockUrl = blockUrl;
		_saveState('blockUrl');
		return this;
	}

	this.getBlockUrl = function()
	{
		return _blockUrl;
	}

	this.getWebsites = function()
	{
		return _websites;
	}

	this.setWebsites = function(websites)
	{
		_websites = websites;
		_saveState('websites');
		return this;
	}

	this.addWebsite = function(website)
	{
		_websites.push(website);
		_saveState('websites');
		return this;
	}

	/**
	 * Pause procrastinator for x amount of seconds
	 * 
	 * @param {int} seconds 
	 */
	this.pause = function(seconds)
	{
		_enabled = false;
		_pause = seconds;
		_saveState('enabled');
		_saveState('pause');
		return this;
	}

	this.removePause = function()
	{
		_enabled = true;
		_pause = 0;
		_saveState('enabled');
		_saveState('pause');
		return this;
	}

	/**
	 * Determine the current pause state
	 */
	this.paused = function()
	{
		return _pause > 0;
	}

	/**
	 * Get the number of seconds procastinator has been paused for
	 * 
	 * @return {int}
	 */
	this.pauseFor = function()
	{
		return _pause;
	}

	/**
	 * determines if the blocker can be executed
	 */
	this.canRunBlocker = function(website)
	{
		return _enabled &&
			(
					(_timecodeControl === 'disabled')
				||
					(_timecodeControl === 'site' && website.timecode.isActive())//_isTimecodeActive(website.timecode)
				||
					(_timecodeControl === 'global' && _timecodeGlobal.isActive())//_isTimecodeActive(_timecodeGlobal)
			);
	}

	/**
	 * DEBUG function
	 * resets the state of the extension
	 */
	this.debugReset = function()
	{
		this.enabled();
		this.setTimecodeControl('site');
		this.setTimecodeGlobal('');
		this.setWebsites([]);
		_saveState();
	}

	/**
	 * Check if the provided url matches any of the registered website patterns.
	 * If it does, return the website pattern match + it's timecode
	 */
	this.matchWebsite = function(url)
	{
		var domain = _getDomainFromUrl(url);
		var regex;
		for (var i = 0, len = _websites.length; i < len; i++) {
			regex = _convertSiteToRegex(_websites[i].pattern);

			if(regex && regex.exec(url)) {
				console.log('match: %o', regex);
				return _websites[i];
			}
		}
		return false;
	}

	/**
	 * reload the state of the extension from the localstorage
	 */
	this.reload = function(callback)
	{
		_loadState(callback);
	}

	/**
	 * Detect the storage engine in use
	 * 
	 * @return string
	 */
	this.storageType = function() 
	{
		return localStorage.length > 0 ? 'localStorage' : 'storage';
	}

	this.upgradeStorage = function(callback)
	{
		var that = this;
		// convert the current localStorage to storage
		var key, value, map = {};
		chrome.storage.sync.clear();
		for (var i = 0; i < localStorage.length; i++) {
			key = localStorage.key(i);
			value = localStorage.getItem(key);
			map[key] = value;
		}
		map['version'] = chrome.app.getDetails().version;
		chrome.storage.sync.set(map, function (data) {
			//localStorage.clear();
			that.reload(callback);
		});
	}

	function _loadState(callback)
	{
		console.log('loading procrastinator state');
		chrome.storage.sync.get(null, function(items) {
			console.info('retrieved storage');
			if (items.enabled !== null) {
				_enabled = items.enabled == 1;
			}
	
			if (items.timecodeControl !== null) {
				_timecodeControl = items.timecodeControl;
			}
			if (items.timecodeGlobal !== null) {
				_timecodeGlobal = new Timecode(items.timecodeGlobal);
			}
	
			if (items.blockUrl !== null) {
				_blockUrl = items.blockUrl;
			}
	
			if (items.pause !== null) {
				_pause = items.pause;
			}
	
			if (items.websites !== null) {
				try {
					_websites = JSON.parse(items.websites) || [];
					// correct the timecodes
	
					for(var i = 0, len = _websites.length; i < len; i++) {
						_websites[i].timecode = new Timecode(_websites[i].timecode);
					}
	
				} catch(e) {
					// invalid json
				}
			}
			callback();
		})
		
		
	}

	/**
	 * Save the state of the procrastinator object
	 */
	function _saveState(what)
	{
		what = what || null;
		console.log('saving state for %s', what);
		if (what === 'enabled' || what === null) {
			localStorage.setItem('enabled', _enabled ? 1 : 0);
		}
		if (what === 'timecodeControl' || what === null) {
			localStorage.setItem('timecodeControl', _timecodeControl);
		}
		if (what === 'timecodeGlobal' || what === null) {
			localStorage.setItem('timecodeGlobal', _timecodeGlobal.get());
		}
		if (what === 'blockUrl' || what === null) {
			localStorage.setItem('blockUrl', _blockUrl);
		}

		if (what === 'pause' || what === null) {
			localStorage.setItem('enabled', _enabled ? 1 : 0);
			localStorage.setItem('pause', _pause);
		}

		if (what === 'websites' || what === null) {
			var ws = _websites;
			// convert timecodes back to strings
			for(var i = 0, len = ws.length; i < len; i++) {
				ws[i].timecode = ws[i].timecode.get();
			}
			localStorage.setItem('websites', JSON.stringify(ws));
		}
		return true;
	}

	/**
	 * extract the domain name from the provided url
	 *
	 * @return string
	 */
	function _getDomainFromUrl(url)
	{
		var parts = url.split('/');
		return parts[2];
	}

	function _convertSiteToRegex(site)
	{
		// don't convert regex's
		if (site.indexOf('/') != 0) {
			site = site.replace(/\*/, '(.*)');
			site = site.replace(/\//, '\/');
		}
		return new RegExp(site);
	}

	return this;
})();

/**
 * Handles the icon functionality
 */
var extensionIcon = (function() {
	var _states = {
		'enabled': {
			'icon': 'images/remove_16.png',
			'title': 'Procrastinator: Enabled'
		},
		'disabled': {
			'icon': 'images/remove_16_disabled.png',
			'title': 'Procrastinator: Enabled'
		}
	};
	var _currentState = 'enabled';

	this.enable = function()
	{
		_buttonState('enabled');
	}

	this.disable = function()
	{
		_buttonState('disabled');
	}

	this.getState = function()
	{
		return _currentState;
	}

	this.showPanel = function()
	{
	}

	function _buttonState(state)
	{
		if (state === _currentState) {
			return false;
		}
		console.log('changing button state to: %s', state);
		_currentState = state;
		chrome.browserAction.setTitle({title: _states[state].title});
		chrome.browserAction.setIcon({path: _states[state].icon});
	}

	return this;
})();
