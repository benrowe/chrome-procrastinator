/**
 * Main control logic for popup.html
 */

$(function() {
	// load the current domain into the input val
	chrome.tabs.getSelected(null, function(tab){
		if (match = /https?:\/\/([^\/]+)/.exec(tab.url)) {
			// extract the domain

			$('#pattern').val(match[1]);
		};
	});

	// display extension version
	$('.version').on('click', function(e) {
		e.preventDefault();
		openUrl(chrome.extension.getURL('options.html#roadmapModal'), true);
		return false;
	}).text(chrome.app.getDetails().version);

	// open options
	$('.options').click(function(e) {
		e.preventDefault();
		openUrl(chrome.extension.getURL('options.html'), true);
		return false;
	});

	// get the current url, if we can
	if (procrastinator.isEnabled() === false) {
		$('#saved').text('Enable Procrastinator').toggleClass('enabled').toggleClass('disabled');
	}

	//if (procrastinator.getTimecodeControl() !== 'site') {
		$('.row-item.timecode').remove();
	//}

	$('#quickadd').click(function()
	{
		var pattern = $('#pattern').val();
		if (pattern !== '') {
			var tc;
			try {
				tc = new Timecode('');//$('#timecode').val());
			} catch(e) {
				tc = new Timecode('');
			}

			var ws = {pattern: $('#pattern').val(), timecode: tc};
			procrastinator.addWebsite(ws);
			refreshPC('popup');
			window.close();
		}
	});

	$('#pause').click(function() {
		procrastinator.pause(5);
		refreshPC('popup');
	});

	$('#saved').click(function() {
		toggleenable(procrastinator.isEnabled());
	});
});

detectRefresh('popup', function(request) {
	// reload enabled state
	if (procrastinator.isEnabled()) {
		$('#saved').text('Enable Procrastinator').toggleClass('enabled').toggleClass('disabled');
		procrastinator.disabled();
	} else {
		$('#saved').text('Disable Procrastinator').toggleClass('enabled').toggleClass('disabled');
		procrastinator.enabled();
	}
});

/**
 * Toggle the enabled status of procastinator
 * 
 * @param {bool} currentlyEnabled
 */
function toggleenable(currentlyEnabled)
{
	// notify the rest of the extesion that we've changed the procrastinator state
	if (currentlyEnabled === true) {
		$('#saved').text('Enable Procrastinator').toggleClass('enabled').toggleClass('disabled');
		procrastinator.disabled();
	} else {
		$('#saved').text('Disable Procrastinator').toggleClass('enabled').toggleClass('disabled');
		procrastinator.enabled();
	}
	refreshPC('popup');
}