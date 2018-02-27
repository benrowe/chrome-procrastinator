import Timecode from "./timecode";

export default class Website
{
    constructor(public pattern: string, public timecode: Timecode) 
    {
    }

    public match(url: string): boolean
    {
        let regex = this.convertPatternToRegex(this.pattern);
        return regex && regex.exec(url) ? true : false;
    }

    public toObject(): object
    {
        const pattern = this.pattern;
        const timecode = this.timecode.timecode;

        return {
            pattern,
            timecode
        }
    }

  private convertPatternToRegex(pattern: string): RegExp
	{
		// don't convert regex's
		if (pattern.indexOf("/") !== 0) {
			pattern = pattern.replace(/\*/, "(.*)");
			pattern = pattern.replace(/\//, "\/");
		}
		return new RegExp(pattern);
	}
}
