import procrastinator from "./procrastinator";

const REFRESH_TYPE = 'refresh';

/**
 * Publish a refresh procrastinator event to all running instances of the extension
 * 
 * @param {string} publisher the subsystem name that's publishing the event
 */
export function refreshPC(publisher: string)
{
	setTimeout(function() {
		chrome.extension.sendRequest({
			type: REFRESH_TYPE,
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
export function detectRefresh(currentPublisher: string, callback: (request: any) => void)
{
	chrome.extension.onRequest.addListener(function(request: any) {
		if (request.type === REFRESH_TYPE) {
			if (request.data.publisher !== currentPublisher) {
				procrastinator.get().reload(function() {
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
export function openUrl(url: string, createNewTab: boolean = false)
{
	let tabId: number;
	if (tabId = tabExists(url)) {
		chrome.tabs.update(tabId, {selected: true});
	} else if(createNewTab === false) {
		tabReplaceCurrent(url);
	} else {
		tabCreate(url)
	}
}

function tabReplaceCurrent(url: string)
{
	chrome.tabs.getSelected(null, function(tab: any) {
		chrome.tabs.update(tab.id, {url: url, selected: true});
	})
}

function tabCreate(url: string)
{
	chrome.tabs.create({url:url,selected:true});
}

/**
 *
 */
function tabExists(url: string): number
{
	let exists = 0;
	chrome.tabs.getAllInWindow(null, function(tabs: any) {
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