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
	procrastinator.on('init', function() {
		if (procrastinator.getTimecodeControl() === 'site') {
			enableTimecodeInput();	
		} else {
			disableTimecodeInput();
		}
		if (procrastinator.isEnabled() === false) {
			$('#saved').text('Enable Procrastinator').toggleClass('enabled').toggleClass('disabled');
		}
	})
	

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
	

	$('#quickadd').click(function()
	{
		var pattern = $('#pattern').val();
		if (pattern !== '') {
			var tc = new Timecode('');
			
			if (procrastinator.getTimecodeControl() === 'site') {
				try {
					var val = $('.row-item.timecode input').val();
					if (val !== '') {
						tc = new Timecode(val);//$('#timecode').val());
					}
				} catch(e) {
					tc = getRecentSiteTimecode().get();
				}
			}
			

			var ws = new Website($('#pattern').val(), tc);
			procrastinator.addWebsite(ws);
			refreshPC('popup');
			window.close();
		}
	});

	$('#pause').click(function() {
		procrastinator.pause(300);
		toggleenable(true);
	});

	$('#saved').click(function() {
		toggleenable(procrastinator.isEnabled());
	});
});

detectRefresh('popup', function(request) {
	// reload enabled state
	if (procrastinator.isEnabled()) {
		$('#saved').text('Disable Procrastinator').toggleClass('enabled').toggleClass('disabled');
		procrastinator.enabled();
	} else {
		$('#saved').text('Enable Procrastinator').toggleClass('enabled').toggleClass('disabled');
		procrastinator.disabled();
	}

	if (procrastinator.getTimecodeControl()) {
		enableTimecodeInput();	
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

function enableTimecodeInput() 
{
	$('.row-item.timecode').show();
	var $tc = $('.row-item.timecode input');
	if ($tc.val() === '') {
		$tc.val(getRecentSiteTimecode().get());
	}
}

function disableTimecodeInput()
{
	$('.row-item.timecode').hide();
}

function getRecentSiteTimecode()
{
	var websites = procrastinator.getWebsites();
	var website = websites.pop();
	return website.timecode;
}