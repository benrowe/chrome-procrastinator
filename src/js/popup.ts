/// <reference types="chrome/chrome-app"/>
import Procrastinator from './procrastinator';
import {refreshPC, detectRefresh, openUrl} from './global';
import procrastinator from './procrastinator';
import timecodeControl from './timecode-control';
import Timecode from './timecode';
import Website from './website';

import Vue from 'vue';
import Version from './components/Version.vue';
import ActionBar from './components/ActionBar.vue';
import Action from './components/Action.vue';
import Icon from './components/Icon.vue';
import TimecodeControl from './timecode-control';

let pc: Procrastinator.State = Procrastinator.get();
pc.on(Procrastinator.Events.init, () => {
	
	let app = new Vue({
		el: "#app",
		template: `
			<div>
				<h1>Procrastinator!!!</h1>
				<action-bar>
					<action @click.native="openOptions" tooltip="Open the options window"><icon type="spanner" />Options</action>

					<action v-if="enabled" @click.native="toggleEnable" tooltip="Disable procrastinator"><icon type="power" />Disable</action>
					<action v-else @click.native="toggleEnable" tooltip="Enable procrastinator"><icon type="power" />Enable</action>

					<action @click.native="pause" tooltip="Pause for 5 minutes"><icon type="pause" />Pause</action>
				</action-bar>
				<fieldset class="well well-small">
					<legend>Quick Add</legend>
					<div class="control-group">
						<div class="controls"><input v-model="pattern" /></div>
					</div>
					<div v-show="tcEnabled" class="row-item timecode">
						<label for="" class="row-label">Timecode</label>
						<div class="input-area"><input v-model="timecode" placeholder="0900-1200,1300-1730" /></div>
					</div>
					<button @click="quickAdd">Quick Add</button>
				</fieldset>
				<version @click.native="openOptions('roadmapModal')" :version="version" />
			</div>
		`,
		data() {
			return {
				version: '',
				enabled: true,
				pattern: '',
				timecode: '',
				tcEnabled: false,
			}
		},
		components: {
			Version,
			ActionBar,
			Action,
			Icon,
		},
		methods: {
			openOptions(section:string = '') {
				let page = 'options.html';
				if (section != '') {
					page += '#'+section;
				}
				openUrl(chrome.extension.getURL(page), true);
			},
			toggleEnable() {
				this.enabled = !this.enabled;
				this.enabled ? pc.disable() : pc.enable();
				refreshPC('popup');
			},
			quickAdd() {
				if (this.pattern == '') {
					return;
				}
				let tc: Timecode = new Timecode('');
				if (this.tcEnabled) {
					try {
						tc = new Timecode(this.timecode);
					} catch (e) {
						tc = getRecentSiteTimecode();
					}
				}

				const ws = new Website(this.pattern, tc);
				pc.addWebsite(ws);
				refreshPC('popup');
				window.close();
			},
			pause() {
				pc.pause(300);
			},
		},
		mounted() {

			this.version = chrome.app.getDetails().version;
			this.timecode = getRecentSiteTimecode().timecode;

			chrome.tabs.getSelected(null, (tab) => {
				console.log(tab);
				let match: RegExpExecArray = /https?:\/\/([^\/]+)/.exec(tab.url);
				if (match) {
					// extract the domain
					this.pattern = match[1];
				};
			});
		},
	});
	detectRefresh('popup', function(request: any) {
		// reload enabled state
		app.enabled = pc.isEnabled();
		app.tcEnabled = pc.timecodeControl == TimecodeControl.Types.site;
	});
});

function getRecentSiteTimecode(): Timecode
{
	const websites = pc.websites;
	if (websites.length > 0) {
		const website = websites.pop();
		return website.timecode;
	}
	return new Timecode('');
}
