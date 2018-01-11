
/**
 * Represents a pattern and additionally it's supplied timecode
 * 
 * @param {string} pattern 
 * @param {string|Timecode} timecode 
 */
function Website(pattern, timecode)
{
    var _pattern;
    var _timecode;

    // constructor
    (function() {
        _setPattern(pattern);
        _setTimecode(timecode);
    })();

    function _setPattern(pattern)
    {
        _pattern = pattern;
    }

    function _setTimecode(timecode)
    {
        if (typeof timecode === 'string') {
            timecode = new Timecode(timecode);
        }
        _timecode = timecode;
    }

    function _getPattern()
    {
        return _pattern;
    }

    function _getTimecode()
    {
        return _timecode;
    }

    this.pattern = function() 
    {
        return _getPattern();
    }

    this.timecode = function()
    {
        return _getTimecode();
    }

    /**
     * check if the supplied url matches this pattern
     * 
     * @param {string} url 
     * @return {bool}
     */
    this.match = function(url)
    {
        var regex = _convertPatternToRegex(_getPattern());
        if (regex && regex.exec(url)) {
            return true;
        }
        return false;
    }

    /**
     * Generate a version of this object as a simple object
     */
    this.toObject = function() 
    {
        return {
            pattern: _getPattern(),
            timecode: _getTimecode().get()
        };
    }

    function _convertPatternToRegex(pattern)
	{
		// don't convert regex's
		if (pattern.indexOf('/') != 0) {
			pattern = pattern.replace(/\*/, '(.*)');
			pattern = pattern.replace(/\//, '\/');
		}
		return new RegExp(pattern);
	}
}