import ExtensionIcon from './extension-icon';
import Procrastinator from './procrastinator';
import { detectRefresh, refreshPC } from './global';

let icon = new ExtensionIcon;
let procrastinator = Procrastinator.get();
procrastinator.on(Procrastinator.Events.init, () => {
	// update the button state if procrastinator is disabled
	if (procrastinator.isEnabled() === false) {
		icon.disable();
	}
});

if (procrastinator.storageType() === Procrastinator.StorageType.local) {
	procrastinator.upgradeStorage(() => {
		console.info('storage upgraded');
	});
}

let pauseTimeout: number;

detectRefresh('bg', function(request) {
	console.info('reloaded the settings, and re-applying them');
	// change the button state, if required
	if (procrastinator.isEnabled() === false) {
		icon.disable()
		clearTimeout(pauseTimeout);
		pauseTimeout = 0;
	} else {
		icon.enable();
	}
	if (procrastinator.paused() && pauseTimeout == 0) {
		console.info('detected pause. starting timer for ' + procrastinator.pauseFor());
		pauseTimeout = setTimeout(function() {
			console.info('upausing');
			procrastinator.removePause();

			pauseTimeout = 0;
			icon.enable();
			refreshPC('bg');
		}, procrastinator.pauseFor() * 1000);
	}
});

// check requested url
chrome.webRequest.onBeforeRequest.addListener(function(details) {

	if (!/^https?/.test(details.url)) {
		return {};
	}
	console.info('checking url: '+details.url);
	const match = procrastinator.matchWebsite(details.url);
	if (!match || !procrastinator.canRunBlocker(match)) {
		return {};
	}
	// block url
	let url = chrome.extension.getURL('block.html')
	if (procrastinator.blockUrl != '') {
		url = procrastinator.blockUrl;
	}
	return {redirectUrl: url+'?r='+encodeURI(details.url)};
}, {urls: ["<all_urls>"]}, ["blocking"]);
