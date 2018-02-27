/**
 * Handles timecodes
 * A timecode is a string formatted like
 * 0000-0900,1200-1234
 */
export default class Timecode 
{
	private tc: string;

	constructor(timecode: string, options: any = {})
	{
		this.timecode = timecode;
	}

	/**
	 * set the timecode
	 */
	public set timecode(timecode: string)
	{
		this.setValue(timecode);
	}

	/**
	 * get the timecode
	 */
	public get timecode(): string
	{
		return this.tc;
	}

	/**
	 * get the seperate parts of the timecode
	 */
	public parts(): Array<string>
	{
		return this.extractParts(this.timecode);
	}

	public isEmpty(): boolean
	{
		return this.timecode === '';
	}

	/**
	 * Check if the timecode is active, based on the current or provided date object
	 *
	 * @param Date date
	 * @return boolean
	 */
	public isActive(date: Date = new Date): boolean
	{
		var parts = this.extractParts(this.timecode);
		for (var i = 0, len = parts.length; i < len; i++) {
			if (this.matchSegmentPeriod(parts[i], date)) {
				return true;
			}
		}
		return false;
	}

	private setValue(timecode: string)
	{
		if (this.validate(timecode)) {

			this.tc = this.filter(timecode);
		} else {
			throw "invalid_timecode";
		}
	}

	private validate(timecode: string)
	{
		let tc = timecode;

		// empty timecode is still valid
		if(!tc) {
			tc = '';
		}

		if (tc.trim() === '') {
			return true
		}

		var parts = this.extractParts(tc);
		// validate each part
		for (var i = 0, len = parts.length; i < len; i++) {
			if (!this.validateSegment(parts[i])) {
				return false;
			}
		}

		return true;
	}

	private validateSegment(part: string): boolean
	{
		part = part.trim();
		var match = /^(\d{4})\s*-\s*(\d{4})$/.exec(part);
		if (match) {
			// ensure both bits are within 0000-2359 && the 2nd part must be greater than the first
			var start = match[1];
			var end = match[2];
			if (this.validate24HourTimecode(start) && this.validate24HourTimecode(end) && start < end) {
				return true;
			}
		}
		return false;
	}

	private validate24HourTimecode(bit: string): boolean
	{
		var hour = parseInt(bit[0]+bit[1]);
		var min = parseInt(bit[2]+bit[3]);
		return hour >= 0 && hour <= 23 && min >= 0 && min <=59;
	}

	private filter(timecode: string): string
	{
		return timecode.replace(/\s+/g, '');
	}

	private extractParts(timecode: string): string[]
	{
		return timecode.split(',');
	}

	private matchSegmentPeriod(timePeriod:string, date: Date): boolean
	{
		var ts = this.pad(date.getHours().toString())+''+this.pad(date.getMinutes().toString());
		var bits = timePeriod.split('-');
		return bits[0].trim() <= ts && bits[1].trim() >= ts;
	}

	private pad(val: string):string
	{
		while(val.length < 2) {
			val = '0'+val;
		}
		return val;
	}
}
