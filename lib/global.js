function refreshPC(from)
{
	chrome.extension.sendRequest({
		type: 'refresh',
		data: {
			from: from
		}
	});
}

function detectRefresh(who, callback)
{
	chrome.extension.onRequest.addListener(function(request) {
		if (request.type === 'refresh') {
			if (request.data.from !== who) {
				procrastinator.reload(function () {
					callback(request);
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
	if (tab = tabExists(url)) {
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