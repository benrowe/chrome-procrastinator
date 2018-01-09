
/**
 * Handles timecodes
 * A timecode is a string formatted like
 * 0000-0900,1200-1234
 */
function Timecode(timecode, options)
{
	var _timecode;

	// constructor
	(function() {
		_set(timecode);
	})();

	/**
	 * set the timecode
	 *
	 * @param string tc
	 * @return self
	 */
	this.set = function(tc)
	{
		_set(tc);
		return this;
	}

	/**
	 * get the raw timecode
	 *
	 * @return string
	 */
	this.get = function()
	{
		return _timecode;
	}

	/**
	 * get the separate time components as an array of XXXX-XXXX
	 *
	 * @return array
	 */
	this.getParts = function()
	{
		return _parts();
	}

	this.isEmpty = function()
	{
		return _timecode === '';
	}

	/**
	 * Check if the timecode is active, based on the current or provided date object
	 *
	 * @param Date date
	 * @return boolean
	 */
	this.isActive = function(date)
	{
		date = date || new Date;
		var parts = _parts();
		for (var i = 0, len = parts.length; i < len; i++) {
			if (_matchSegmentPeriod(parts[i], date)) {
				return true;
			}
		}
		return false;
	}

	function _matchSegmentPeriod(timePeriod, date)
	{
		var ts = _pad(date.getHours())+''+_pad(date.getMinutes());
		var bits = timePeriod.split('-');
		return bits[0].trim() <= ts && bits[1].trim() >= ts;
	}

	function _pad(val)
	{
		val += ''; // convert to string
		while(val.length < 2) {
			val = '0'+val;
		}
		return val;
	}


	/**
	 * validate a timecode to ensure the string is a valid format
	 * the validation allows for additional spacing and discrepancies within
	 * the format
	 *
	 * @param string tc
	 * @return boolean
	 */
	function _validate(tc)
	{
		tc = tc || _timecode;

		// empty timecode is still valid
		if(!tc) {
			tc = '';
		}

		if (tc.trim() === '') {
			return true
		}

		var parts = _parts(tc);
		// validate each part
		for (var i = 0, len = parts.length; i < len; i++) {
			if (!_validateSegment(parts[i])) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Validate an timecode segment "XXXX-XXXX"
	 *
	 * @param string part
	 * @return boolean
	 */
	function _validateSegment(part)
	{
		part = part.trim();
		var match = /^(\d{4})\s*-\s*(\d{4})$/.exec(part);
		if (match) {
			// ensure both bits are within 0000-2359 && the 2nd part must be greater than the first
			var start = match[1];
			var end = match[2];
			if (_validate24HourTimecode(start) && _validate24HourTimecode(end) && start < end) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Validate a 24 timecoded string "XXXX", ensuring that
	 * it's between 0000-2359 and the minutes do not exceed 60
	 */
	function _validate24HourTimecode(bit)
	{
		var hour = parseInt(bit[0]+bit[1]);
		var min = parseInt(bit[2]+bit[3]);
		return hour >= 0 && hour <= 23 && min >= 0 && min <=59;
	}

	/**
	 * Filters the timecode string to ensure a consistant format
	 *
	 * @param string tc
	 * @return string
	 */
	function _filter(tc)
	{
		return tc.trim().replace(/\s+/g, '');
	}


	/**
	 * set the timecode
	 *
	 * @param string tc
	 */
	function _set(tc)
	{
		tc = tc || '';
		if (_validate(tc)) {

			_timecode = _filter(tc);
		} else {
			throw "invalid_timecode";
		}
	}

	/**
	 * get the timecode parts
	 *
	 * @param string tc
	 * @param array
	 */
	function _parts(tc)
	{
		tc = tc || _timecode;
		return tc.split(',');
	}

	return this;
}
