if (procrastinator.storageType() === 'localStorage') {
	procrastinator.upgradeStorage();
}

procrastinator.on('init', function() {
	// update the button state if procrastinator is disabled
	if (procrastinator.isEnabled() === false) {
		extensionIcon.disable();
	}
});


var pauseTimeout = false;

detectRefresh('bg', function(request) {
	console.info('reloaded the settings, and re-applying them');
	// change the button state, if required
	if (procrastinator.isEnabled() === false) {
		extensionIcon.disable();
		clearTimeout(pauseTimeout);
		pauseTimeout = false;
	} else {
		extensionIcon.enable();
	}
	if (procrastinator.paused() && pauseTimeout === false) {
		console.info('detected pause. starting timer for ' + procrastinator.pauseFor());
		pauseTimeout = setTimeout(function() {
			console.info('upausing');
			procrastinator.removePause();
			
			pauseTimeout = false;
			extensionIcon.enable();
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
	var match = procrastinator.matchWebsite(details.url);
	if (!match || !procrastinator.canRunBlocker(match)) {
		return {};
	}
	// block url
	var url = chrome.extension.getURL('block.html')
	if (procrastinator.getBlockUrl() != '') {
		url = procrastinator.getBlockUrl();
	}
	return {redirectUrl: url+'?r='+encodeURI(details.url)};
}, {urls: ["<all_urls>"]}, ["blocking"]);

// detect a version change
