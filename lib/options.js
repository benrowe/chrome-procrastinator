var timeTemplate = '<tr><td><input type="text" value="{website}" autofocus /></td><td><input type="text" value="{timecode}" placeholder="0900-1200, 1330-1525" /><i class="icon-trash remove"></i></td></tr>';
var emptyTemplate = '<tr class="empty-row"><td colspan="2">You have no urls/patterns. Try adding a <a href="#" class="new-row">new one</a></td></tr>';

$(function() {
	procrastinator.on('init', function() {
		prepareForm();
		loadForm();
	});
	

	// detect modal open request
	// if url has #modalName, then open modal

	setTimeout(function() {
		var hash = window.location.hash
		window.location.hash = '';
		$(hash).modal('show');
	}, 1000);

	// register form state changes
	$('form').on('change', 'input', function() {
		saveForm();
	})

});

// detect if the procrastinator should be refreshed
detectRefresh('options', function(request) {
	// reload enabled state
	$('input[name=enabled][value='+(procrastinator.isEnabled() ? 'true' : 'false')+']').attr('checked', true);
});

function prepareForm()
{
	$('#form').submit(saveForm);
	$('<button class="btn btn-block"><i class="icon-plus"></i>Add New</button>').click(function(e) {
		e.preventDefault();
		addNewRow();
	}).appendTo('fieldset.websites');
	$('.websites').on('click', '.new-row', function(e) {
		e.preventDefault();
		addNewRow();
		return false;
	});
	$('.websites>tbody').on('click', '.remove', function() {
		if(confirm('Are you sure?')) {
			removeRow($(this).parents('tr').index());
		}
	});
}

function addNewRow()
{
	addSite('', '');
}

/**
 * Load the form state
 */
function loadForm()
{
	var sites = procrastinator.getWebsites();
	clearSites();
	for (var i = 0, len = sites.length; i < len; i++) {
		addSite(sites[i].pattern(), sites[i].timecode());
	}
	if (sites.length == 0) {
		addEmptyRowWarning();
	}

	var tcGlobal = procrastinator.getTimecodeGlobal();
	if (tcGlobal) {
		tcGlobal = tcGlobal.get();
	}
	$('input[name=time_control][value='+procrastinator.getTimecodeControl()+']').attr('checked', true);
	$('input[name=time_control_global]').val(tcGlobal);
	$('input[name=block_url]').val(procrastinator.getBlockUrl());
	$('input[name=enabled][value='+(procrastinator.isEnabled() ? 'true' : 'false')+']').attr('checked', true);

}

function clearSites()
{
	$('.websites>tbody').empty();
}

function removeRow(index)
{
	$('.websites>tbody>tr:eq('+index+')').remove();
	addEmptyRowWarning();
	saveForm();
}
function addEmptyRowWarning()
{
	if($('.websites>tbody>tr').length == 0) {
		$('.websites>tbody').append(emptyTemplate);
	}
}

function addSite(website, timecode)
{
	var $tbody = $('.websites>tbody');
	website = website || '';

	timecode = timecode ? timecode.get() : '';
	$tbody.find('.empty-row').remove();
	$tbody.append(timeTemplate.replace('{website}', website).replace('{timecode}', timecode));

}

function saveForm()
{
	if (_isValid()) {
		console.info('Saving form');
		$('#save').html('<i class="icon-refresh icon-white"></i> Saving');
		// notify the rest of the extesion that we've changed the procrastinator state
		procrastinator.setTimecodeControl($('input[name=time_control]:checked').val());
		procrastinator.setTimecodeGlobal(new Timecode($('input[name=time_control_global]').val()));
		procrastinator.setBlockUrl($('input[name=block_url]').val());


		var websites = [], pattern;

		$('.websites>tbody>tr:not(.empty-row)').each(function() {
			pattern = $('input:first', this).val().trim();
			if (pattern !== '') {
				var tmp = new Timecode($('input:last', this).val());
				websites.push(new Website(pattern, tmp));
			}
		});
		procrastinator.setWebsites(websites);

		var enabled = $('input[name=enabled]:checked').val();
		if (enabled === 'true') {
			procrastinator.enabled();
		} else {
			procrastinator.disabled();
		}
		
		refreshPC('options');

		setTimeout(function() {
			$('#save').html('<i class="icon-ok icon-white"></i> Save');
		}, 250);
		
	}
}

/**
 * Perform validation on the form components
 * @todo  implement validation here
 */
function _isValid()
{
	return true;
}

