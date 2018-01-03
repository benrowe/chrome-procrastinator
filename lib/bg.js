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
	console.log('reloaded the settings, and re-applying them');
	// change the button state, if required
	if (procrastinator.isEnabled() === false) {
		extensionIcon.disable();
	} else {
		extensionIcon.enable();
	}
	console.log(procrastinator.paused());
	if (procrastinator.paused() && pauseTimeout === false) {
		console.log('detected pause. starting timer');
		pauseTimeout = setTimeout(function() {
			console.log('unpause');
			procrastinator.removePause();
			refreshPC('bg');
			pauseTimeout = false;
		}, procrastinator.pauseFor() * 1000);
	}
});

// block url
chrome.webRequest.onBeforeRequest.addListener(function(details) {
	console.log('checking url: '+details.url);
	var match = procrastinator.matchWebsite(details.url);
	if (match && procrastinator.canRunBlocker(match)) {
		var url = chrome.extension.getURL('block.html')
		if (procrastinator.getBlockUrl() != '') {
			url = procrastinator.getBlockUrl();
		}
		return {redirectUrl: url};
	}
	return {};
}, {urls: ["<all_urls>"]}, ["blocking"]);

// detect a version change
