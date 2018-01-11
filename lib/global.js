/**
 * Publish a refresh procrastinator event to all running instances of the extension
 * 
 * @param {string} publisher the subsystem name that's publishing the event
 */
function refreshPC(publisher)
{
	setTimeout(function() {
		chrome.extension.sendRequest({
			type: 'refresh',
			data: {
				publisher: publisher
			}
		});
	}, 250);
}

/**
 * Register a refresh procrastinator event handler
 * 
 * @param {string} currentPublisher the publisher listening to the event, helps avoid a feedback event loop
 * @param {function} callback the function to call when a event is detected
 */
function detectRefresh(currentPublisher, callback)
{
	chrome.extension.onRequest.addListener(function(request) {
		if (request.type === 'refresh') {
			if (request.data.publisher !== currentPublisher) {
				procrastinator.reload(function () {
					callback.apply(request);
				});
			}
		}
	});
}

/**
 * open a url in a tab
 * if the url already exists in another tab, then simply focus on that tab instead
 */
function openUrl(url, createNewTab)
{
	if (tabId = tabExists(url)) {
		chrome.tabs.update(tabId, {selected: true});
	} else if(createNewTab === false) {
		tabReplaceCurrent(url);
	} else {
		tabCreate(url)
	}
}

function tabReplaceCurrent(url)
{
	chrome.tabs.getSelected(null, function(tab) {
		chrome.tabs.update(tab.id, {url: url, selected: true});
	})
}

function tabCreate(url)
{
	chrome.tabs.create({url:url,selected:true});
}

/**
 *
 */
function tabExists(url)
{
	var exists = 0;
	chrome.tabs.getAllInWindow(null, function(tabs) {
		var tab;
		for (var i = 0, len = tabs.length; i < len; i++) {
			tab = tabs[i];
			if (tab.url === url) {
				// url already exists, switch tab
				exists = tab.id;
			}
		}
	});
	return exists;
}