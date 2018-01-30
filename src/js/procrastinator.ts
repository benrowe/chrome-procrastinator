/// <reference types="chrome/chrome-app"/>
import Timecode from "./timecode";
import Website from "./website";
import TimecodeControl from "./timecode-control";


module Procrastinator {

	export enum StorageType {
		local,
		sync
	}

	export enum Events {
		init = 'init'
	}

	let pc: State;

	export function get(): State
	{
		if (!pc) {
			pc = new State;
		}
		return pc;
	}

	export class State
	{

		private _enabled: boolean = true;
		private _blockUrl: string;
		private _pause: number = 0;
		private tcControl: TimecodeControl.Types = TimecodeControl.Types.site;
		private tcGlobal: Timecode = new Timecode('');
		private _websites: Array<Website> = [];
		

		private events: { [index:string] : Array<() => void>} = {};

		constructor() 
		{
			this.loadState(() => {
				console.info('Procrastorator has booted with state');
				this.trigger('init');
			})
		}

		public on(event: Events, callback: () => void): void
		{
			if (!this.events[event]) {
				this.events[event] = [];
			}
			this.events[event].push(callback);
		}

		private trigger(event: string)
		{
			if (!this.events[event]) {
				return false;
			}
			
			for (var i = 0; i < this.events[event].length; i++) {
				this.events[event][i]();
			}
		}

		/**
		 * Get the current timecode control mechanism (site, disabled or global)
		 *
		 * @return string
		 */
		get timecodeControl(): TimecodeControl.Types
		{
			return this.tcControl;
		}

		/**
		 * Set the current timecode control mechanism
		 */
		set timecodeControl(timecodeControl: TimecodeControl.Types)
		{
			this.tcControl = timecodeControl;
			this.saveState();
		}

		get timecodeGlobal(): Timecode
		{
			return this.tcGlobal;
		}

		set timecodeGlobal(timecodeGlobal: Timecode)
		{
			this.tcGlobal = timecodeGlobal;
			this.saveState();
		}

		public isEnabled()
		{
			return this._enabled;
		}

		public enable(): this
		{
			this._enabled = true;
			this._pause = 0;
			this.saveState();
			return this;
		}

		public disable(): this
		{
			this._enabled = false;
			this.saveState();
			return this;
		}

		set blockUrl(blockUrl: string)
		{
			this._blockUrl = blockUrl;
			this.saveState();
		}

		get blockUrl()
		{
			return this._blockUrl;
		}

		get websites(): Array<Website>
		{
			return this._websites;
		}

		/**
		 * 
		 * @param {Website[]} websites 
		 */
		set websites(websites: Array<Website>)
		{
			this._websites = websites;
			this.saveState();
		}

		/**
		 * 
		 * @param {Website} website 
		 */
		addWebsite(website: Website): this
		{
			this._websites.push(website);
			this.saveState();
			return this;
		}

		/**
		 * Pause procrastinator for x amount of seconds
		 * 
		 * @param {int} seconds 
		 */
		pause(seconds: number)
		{
			this._enabled = false;
			this._pause = seconds;
			this.saveState();
			return this;
		}

		removePause(): this
		{
			this._enabled = true;
			this._pause = 0;
			this.saveState();
			return this;
		}

		/**
		 * Determine the current pause state
		 */
		paused(): boolean
		{
			return this._pause > 0;
		}

		/**
		 * Get the number of seconds procastinator has been paused for
		 * 
		 * @return {int}
		 */
		pauseFor(): number
		{
			return this._pause;
		}

		/**
		 * determines if the blocker can be executed
		 */
		canRunBlocker(website: Website): boolean
		{
			return this.isEnabled() &&
				(
						(this.timecodeControl == TimecodeControl.Types.disabled)
					||
						(this.timecodeControl === TimecodeControl.Types.site && website.timecode.isActive())
					||
						(this.timecodeControl === TimecodeControl.Types.global && this.timecodeGlobal.isActive())
				);
		}

		/**
		 * DEBUG function
		 * resets the state of the extension
		 */
		debugReset()
		{
			this.enable();
			this.timecodeControl = TimecodeControl.Types.site;
			this.timecodeGlobal = new Timecode('');
			this.websites = [];
			this.saveState();
		}

		/**
		 * Check if the provided url matches any of the registered website patterns.
		 * If it does, return the website pattern match + it's timecode
		 * 
		 * @return {Website|null}
		 */
		matchWebsite(url: string): Website | null
		{
			var domain = this.getDomainFromUrl(url);
			var regex;
			for (var i = 0, len = this._websites.length; i < len; i++) {
				if (this._websites[i].match(url)) {
					return this._websites[i];
				}
			}
			return null;
		}

		/**
		 * reload the state of the extension from the localstorage
		 */
		reload(callback: () => void)
		{
			this.loadState(callback);
		}

		/**
		 * Detect the storage engine in use
		 * 
		 * @return string
		 */
		public storageType(): StorageType
		{
			return localStorage.length > 0 ? StorageType.local : StorageType.sync;
		}

		public upgradeStorage(callback: () => void)
		{
			let that = this;
			// convert the current localStorage to storage
			let key, value, map: any = {};
			chrome.storage.sync.clear();
			for (let i = 0; i < localStorage.length; i++) {
				key = localStorage.key(i);
				value = localStorage.getItem(key);
				map[key] = value;
			}
			map['version'] = chrome.app.getDetails().version;
			chrome.storage.sync.set(map, function () {
				localStorage.clear();
				that.reload(callback);
			});
		}

		private loadState(callback: () => void)
		{
			console.log('loading procrastinator state');
			chrome.storage.sync.get(null, function(items: any) {
				console.info('retrieved storage');
				if (items.enabled !== null) {
					this._enabled = items.enabled == 1;
				}
		
				if (items.timecodeControl !== null) {
					this._timecodeControl = items.timecodeControl;
				}
				if (items.timecodeGlobal !== undefined) {
					this._timecodeGlobal = new Timecode(items.timecodeGlobal.toString());
				} 
		
				if (items.blockUrl !== undefined) {
					this._blockUrl = items.blockUrl;
				}
		
				if (items.pause !== undefined) {
					this._pause = items.pause;
				}
		
				if (items.websites !== undefined && items.websites.toString().length > 2) {
					console.log(items.websites);
					console.log('test');
					try {
						this._websites = JSON.parse(items.toString().websites) || [];
						// correct the timecodes
		
						for(var i = 0, len = this._websites.length; i < len; i++) {
							this._websites[i] = new Website(this._websites[i].pattern, this._websites[i].timecode);
						}
		
					} catch(e) {
						// invalid json
					}
				}
				callback();
			})
			
			
		}

		private saveTimeout: number;

		/**
		 * Save the state of the procrastinator object
		 */
		private saveState(): void
		{
			// debounce the save
			clearTimeout(this.saveTimeout);
			this.saveTimeout = setTimeout(function() {
				console.log('saving state');
				let items: any = {};
				
				items['enabled'] = this._enabled ? 1 : 0;
				items['timecodeControl'] = this.tcControl.toString();
				items['timecodeGlobal'] = this._timecodeGlobal.get();
				items['blockUrl'] = this._blockUrl;
				items['pause'] = this._pause;

				var ws = [];
				// convert timecodes back to strings
				for(var i = 0, len = this._websites.length; i < len; i++) {
					ws.push(this._websites[i].toObject());
				}
				items['websites'] = JSON.stringify(ws);
				chrome.storage.sync.set(items, function() {
				
				});
			}, 30);
		}

		/**
		 * extract the domain name from the provided url
		 *
		 * @return string
		 */
		private getDomainFromUrl(url: string): string
		{
			var parts = url.split('/');
			return parts[2];
		}
	}
}

export default Procrastinator;