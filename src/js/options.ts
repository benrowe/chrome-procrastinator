import Procrastinator from "./procrastinator";
import Vue from "vue";
import TimecodeControl from "./timecode-control";
import Timecode from "./timecode";

import Version from './components/Version.vue';
import ActionBar from './components/ActionBar.vue';
import Action from './components/Action.vue';
import Icon from './components/Icon.vue';
import { detectRefresh, refreshPC } from "./global";
import Website from "./website";

let pc = Procrastinator.get();
let app: any;

pc.on(Procrastinator.Events.init, () => {
	app = new Vue({
		el: "#app",
		data() {
			return {
				pc: {
					websites: [],
					enabled: 'true',
					timecodeControl: TimecodeControl.Types.site,
					timecodeGlobal: new Timecode(''),
					blockUrl: '',
				},
				website: '',
				timecode: '',
				saving: false,
			}
		},
		components: {
			Action,
			ActionBar,
			Icon,
		},
		created() {
			this.pc.websites = pc.websites;
			this.pc.enabled = pc.isEnabled(),
			this.pc.timecodeControl = pc.timecodeControl;
			this.pc.timecodeGlobal = pc.timecodeGlobal;
			this.pc.blockUrl = pc.blockUrl;
		},
		methods: {
			save() {
				this.saving = true;
				pc.timecodeControl = this.pc.timecodeControl;
				pc.timecodeGlobal = this.pc.timecodeGlobal;
				pc.blockUrl = this.pc.blockUrl;
				pc.websites = this.pc.websites;
				if (this.pc.enabled == 'true') {
					pc.enable();
				} else {
					pc.disable();
				}
				refreshPC('options');
				this.saving = false;
			},
			addWebsite() {
				let website = new Website(this.website, new Timecode(this.timecode));
				this.pc.websites.push(website);

				this.website = '';
				this.timecode = '';
				this.save();
			},
			removeWebsite(pattern: string) {
				for (let i = 0; i < this.pc.websites.length; i++) {
					if (this.pc.websites[i].pattern === pattern) {
						delete this.pc.websites[i];
					}
				}
				this.save();
			},
		},

	});
	detectRefresh('options', (request: any) => {
		app.pc.enabled = pc.isEnabled() ? 'true' : 'false';
		app.pc.websites = pc.websites;
	});
});
