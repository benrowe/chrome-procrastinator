// detect if procrastinator has been updated by chrome
// and handle any update logic
chrome.storage.sync.set({'version': 1});
chrome.storage.sync.get('version', function(items) {
	var oldVersion = typeof items.version == "undefined" ? 0 : items.version;
	var newVersion = chrome.app.getDetails().version;
	if (oldVersion !== newVersion) {
		switch (newVersion) {
			case '1.1.0':
				//alert(oldVersion);
				//alert(newVersion);
				break;
		}
		// update the version stored to the new
		chrome.storage.sync.set({version: newVersion});
	}
})

// update the button state if procrastinator is disabled
if (procrastinator.isEnabled() === false) {
	extensionIcon.disable();
}

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
