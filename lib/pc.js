var procrastinator = (function() {

	var _enabled = true;
	var _pause = false;
	var _timecodeControl = 'site'; // or disabled/global
	var _timecodeGlobal = '';
	var _websites = [];
	var _blockUrl = '';

	/**
	 * Constructor
	 */
	(function() {
		_loadState();
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
	this.reload = function()
	{
		_loadState();
	}

	function _loadState()
	{
		console.log('loading procrastinator state');
		if (localStorage.getItem('enabled') !== null) {
			_enabled = localStorage.getItem('enabled') == 1;
		}

		if (localStorage.getItem('timecodeControl') !== null) {
			_timecodeControl = localStorage.getItem('timecodeControl');
		}
		if (localStorage.getItem('timecodeGlobal') !== null) {
			_timecodeGlobal = new Timecode(localStorage.getItem('timecodeGlobal'));
		}

		if (localStorage.getItem('blockUrl') !== null) {
			_blockUrl = localStorage.getItem('blockUrl');
		}

		if (localStorage.getItem('websites') !== null) {
			try {
				_websites = JSON.parse(localStorage.getItem('websites')) || [];
				// correct the timecodes

				for(var i = 0, len = _websites.length; i < len; i++) {
					_websites[i].timecode = new Timecode(_websites[i].timecode);
				}

			} catch(e) {
				// invalid json
			}
		}
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

		if (what === 'pause') {
			localStorage.setItem('enabled', _enabled ? 1 : 0);
			localStorage.setItem('pause')
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
