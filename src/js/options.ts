
import pc from "./procrastinator";
import Timecode from './timecode';
import { detectRefresh, refreshPC } from "./global";
import Website from "./website";
import timecodeControl from "./timecode-control";

const timeTemplate = '<tr><td><input type="text" value="{website}" autofocus /></td><td><input type="text" value="{timecode}" placeholder="0900-1200, 1330-1525" /><i class="icon-trash remove"></i></td></tr>';
const emptyTemplate = '<tr class="empty-row"><td colspan="2">You have no urls/patterns. Try adding a <a href="#" class="new-row">new one</a></td></tr>';

let procrastinator = pc.get();
$(function() {
	procrastinator.on(pc.Events.init, function() {
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
detectRefresh('options', (request: any) => {
	// reload enabled state
	$('input[name=enabled][value='+(procrastinator.isEnabled() ? 'true' : 'false')+']').attr('checked', 'checked');
});

function prepareForm()
{
	$('#form').submit(saveForm);
	$('<button class="btn btn-block"><i class="icon-plus"></i>Add New</button>').click(function(e: Event) {
		e.preventDefault();
		addNewRow();
	}).appendTo('fieldset.websites');
	$('.websites').on('click', '.new-row', function(e: Event) {
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

function addNewRow(): void
{
	addSite('', '');
}

/**
 * Load the form state
 */
function loadForm()
{
	var sites = procrastinator.websites;
	clearSites();
	for (var i = 0, len = sites.length; i < len; i++) {
		addSite(sites[i].pattern, sites[i].timecode.timecode);
	}
	if (sites.length == 0) {
		addEmptyRowWarning();
	}

	var tcGlobal = procrastinator.timecodeGlobal.timecode;
	$('input[name=time_control][value='+procrastinator.timecodeControl.toString()+']').attr('checked', 'checked');
	$('input[name=time_control_global]').val(tcGlobal);
	$('input[name=block_url]').val(procrastinator.blockUrl);
	$('input[name=enabled][value='+(procrastinator.isEnabled() ? 'true' : 'false')+']').attr('checked', 'checked');
}

function clearSites()
{
	$('.websites>tbody').empty();
}

function removeRow(index:number)
{
	$('.websites>tbody>tr:eq('+index.toString()+')').remove();
	addEmptyRowWarning();
	saveForm();
}
function addEmptyRowWarning()
{
	if($('.websites>tbody>tr').length == 0) {
		$('.websites>tbody').append(emptyTemplate);
	}
}

function addSite(website: string, timecode: string)
{
	var $tbody = $('.websites>tbody');
	$tbody.find('.empty-row').remove();
	$tbody.append(timeTemplate.replace('{website}', website).replace('{timecode}', timecode));
}

function saveForm()
{
	if (_isValid()) {
		console.info('Saving form');
		$('#save').html('<i class="icon-refresh icon-white"></i> Saving');
		// notify the rest of the extesion that we've changed the procrastinator state
		let tc: string = $('input[name=time_control]:checked').val().toString();
		var tcc: timecodeControl.Types = timecodeControl.Types[tcc as keyof typeof timecodeControl.Types];
		procrastinator.timecodeControl = tcc;
		procrastinator.timecodeGlobal = new Timecode($('input[name=time_control_global]').val().toString());
		procrastinator.blockUrl = $('input[name=block_url]').val().toString();


		var websites: Array<Website> = [], pattern: string;

		$('.websites>tbody>tr:not(.empty-row)').each(function() {
			pattern = $.trim($('input:first', this).val().toString());
			if (pattern !== '') {
				var tmp = new Timecode($('input:last', this).val().toString());
				websites.push(new Website(pattern, tmp));
			}
		});
		procrastinator.websites = websites;

		var enabled = $('input[name=enabled]:checked').val();
		if (enabled === 'true') {
			procrastinator.enable();
		} else {
			procrastinator.disable();
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
function _isValid(): boolean
{
	return true;
}

