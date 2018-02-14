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

let v = new Vue({
    el: "#app",
    template: `
	<div>
		<h1>Procrastinator!!!</h1>
		<action-bar>
			<action v-on:click.native="openOptions"><icon type="spanner" />Options</action>
			<action v-if="enabled" v-on:click.native="toggleEnable"><icon type="power" />Disable</action>
			<action v-else v-on:click.native="toggleEnable"><icon type="power" />Enable</action>
			<action><icon type="pause" />Pause</action>
		</action-bar>
        <version :version="version" />
        </div>
    `,
    data() {
		return {
			version: '',
			actions: [
				{
					label: 'Options',
					icon: 'spanner'
				},
				{
					label: 'Disable',
					icon: 'power'
				},
				{
					label: 'Pause',
					icon: 'pause'
				}
			]
		}
	},
    components: {
		Version,
		ActionBar,
		Action,
		Icon
	},
	methods: {
		openOptions() {
			alert('open');
			openUrl(chrome.extension.getURL('options.html'), true);
		}
	},
	mounted() {
		this.version = '?';//chrome.app.getDetails().version; 
	}
});

let pc = procrastinator.get();
pc.on(procrastinator.Events.init, function():void {
	if (pc.timecodeControl === timecodeControl.Types.site) {
		enableTimecodeInput();	
	} else {
		disableTimecodeInput();
	}
	if (pc.isEnabled() === false) {
		$('#saved').text('Enable Procrastinator').toggleClass('enabled').toggleClass('disabled');
	}

	initVersion();
	initPattern();
	initOptions();

	document.getElementById('quickadd').addEventListener('click', function() {
		var pattern = $('#pattern').val(); 
		if (pattern !== '') {
			var tc: Timecode = new Timecode('');
			
			if (pc.timecodeControl == timecodeControl.Types.site) {
				try {
					var val = $('.row-item.timecode input').val();
					if (val !== '') {
						tc = new Timecode(val);
					}
				} catch(e) {
					tc = getRecentSiteTimecode();
				}
			}

			
			var ws = new Website($('#pattern').val(), tc);
			pc.addWebsite(ws);
			refreshPC('popup');
			window.close();
		}
	});

	document.getElementById('pause').addEventListener('click', function() {
		pc.pause(300);
		toggleenable(true);
	})

	document.getElementById('saved').addEventListener('click', function() {
		toggleenable(pc.isEnabled());
	})
});
/**
 * Main control logic for popup.html
 */

function initVersion(): void
{
	let version: Element = document.querySelector('.version');
	version.addEventListener('click', function (e: Event) {
		e.preventDefault();
		openUrl(chrome.extension.getURL('options.html#roadmapModal'), true);
		return false;
	});
	version.innerHTML = chrome.app.getDetails().version;
}

function initPattern(): void
{
	chrome.tabs.getSelected(null, function(tab){
		let match: RegExpExecArray = /https?:\/\/([^\/]+)/.exec(tab.url);
		if (match) {
			// extract the domain
			$('#pattern').val(match[1]);
		};
	});
}

function initOptions(): void
{
	document.querySelector('.options').addEventListener('click', function(e: Event) {
		e.preventDefault();
		openUrl(chrome.extension.getURL('options.html'), true);
		return false;
	});
}

detectRefresh('popup', function(request: any) {
	// reload enabled state
	if (pc.isEnabled()) {
		$('#saved').text('Disable Procrastinator').toggleClass('enabled').toggleClass('disabled');
		pc.enable();
	} else {
		$('#saved').text('Enable Procrastinator').toggleClass('enabled').toggleClass('disabled');
		pc.disable();
	}

	if (pc.timecodeControl == timecodeControl.Types.site) {
		enableTimecodeInput();	
	}
});

/**
 * Toggle the enabled status of pc
 * 
 * @param {bool} currentlyEnabled
 */
function toggleenable(currentlyEnabled: boolean)
{
	// notify the rest of the extesion that we've changed the procrastinator state
	if (currentlyEnabled === true) {
		$('#saved').text('Enable Procrastinator').toggleClass('enabled').toggleClass('disabled');
		pc.disable();
	} else {
		$('#saved').text('Disable Procrastinator').toggleClass('enabled').toggleClass('disabled');
		pc.enable();
	}
	refreshPC('popup');
}

function enableTimecodeInput() 
{
	$('.row-item.timecode').show();
	var $tc = $('.row-item.timecode input');
	if ($tc.val() === '') {
		$tc.val(getRecentSiteTimecode().timecode);
	}
}

function disableTimecodeInput()
{
	$('.row-item.timecode').hide();
}

function getRecentSiteTimecode(): Timecode
{
	var websites = pc.websites;
	if (websites.length > 0) {
		var website = websites.pop();
		return website.timecode;
	}
	return new Timecode('');
}