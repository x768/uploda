
var file_list = [];
var select_start = -1;
var sort_key = 'filename';
var sort_reverce = false;
var rename_edit = false;

var FILENAME = /^[^\.\/][^\/]*$/;


function uploadFile(f, complete)
{
	var xhr = new XMLHttpRequest();

	xhr.upload.addEventListener("progress", function(e)
	{
		//document.title = 'progress:' + ((e.loaded / e.total) * 100) + '%';
	}, false);
	xhr.upload.addEventListener("load", function(e)
	{
		complete(xhr.responseText);
	}, false);
	xhr.upload.addEventListener("error", function(e)
	{
		alert("error:" + e.target.status);
	}, false);

	xhr.open("POST", "up.php/" + encodeURIComponent(f.fileName));

	xhr.setRequestHeader("Content-Type", f.type);
	xhr.send(f);
}
function confirmOverWrite(files)
{
	var i, j;
	var matches = [];

	for (i = 0; i < files.length; i++) {
		var fname = files[i].fileName;
		for (j = 0; j < file_list.length; j++) {
			if (fname == file_list[j].filename)
				matches.push(fname);
		}
	}
	if (matches.length > 0) {
		var msg = matches.join(", ") + " を上書きしますか？";
		return confirm(msg);
	} else {
		return true;
	}
}

function createDrop(id, complete)
{
	var elem = document.getElementById(id);

	elem.addEventListener("dragover", function(e)
	{
		e.preventDefault();
		return false;
	}, false);

	elem.addEventListener("drop", function(e)
	{
		var files = e.dataTransfer.files;
		if (confirmOverWrite(files)) {
			for (var i = 0; i < files.length; i++) {
				uploadFile(files[i], complete);
			}
		}
		e.stopPropagation();
		return false;
	}, false);
}

function deleteFileList()
{
	var list = $('.selected .filename');

	if (list.size() == 0) {
		return;
	} else if (list.size() == 1) {
		if (!confirm($(list[0]).text() + " を削除しますか？"))
			return;
	} else {
		if (!confirm("選択中の" + list.size() + "個のファイルを削除しますか？"))
			return;
	}

	var files = [];
	for (var i = 0; i < list.size(); i++) {
		files.push($(list[i]).text());
	}
	$.ajax({
		type: "POST",
		url: "del.php",
		contentType: "text/plain",
		data: files.join("/"),
		processData: false,
		dataType: "text",
		success: function(msg)
		{
			updateFileList();
			updateInfoBox(-1, -1);
		},
		error: function(xhr, msg, err)
		{
			alert("error:" + msg + ":" + err);
		}
	});
}
function renameFileList(input)
{
	var new_name = input.val();
	var prev_name = input.parent().find('.filename').text();
	var i;

	if (new_name == prev_name) {
		return;
	}
	if (new_name.match(FILENAME)) {
		for (i = 0; i < file_list.length; i++) {
			if (new_name == file_list[i].filename) {
				alert("すでに存在しているファイル名です。");
				return;
			}
		}
	} else {
		alert("ファイル名が.で始まっているか、/が含まれています。");
		return;
	}

	$.ajax({
		type: "POST",
		url: "ren.php",
		contentType: "text/plain",
		data: prev_name + "/" + new_name,
		processData: false,
		dataType: "text",
		success: function(msg)
		{
			updateFileList();
			updateInfoBox(-1, -1);
		},
		error: function(xhr, msg, err)
		{
			alert("error:" + msg + ":" + err);
		}
	});
}
function renameClose(input)
{
	input.parent().find('.filename').css('display', '');
	input.remove();
	rename_edit = false;
}

function refreshFileList()
{
	var list = $('#file-list');
	list.find('tr').remove();
	
	for (var i = 0; i < file_list.length; i++) {
		var f = file_list[i];
		var tr = $('<tr/>');
		var td = $('<td/>');
		td.append($('<img/>').attr('src', 'icon/' + f.icon).attr('alt', ''));
		td.append($('<span/>').attr('class', 'filename').append(f.filename));
		tr.append(td);
		tr.append($('<td/>').attr('class', 'size').append(f.size_fmt));
		tr.append($('<td/>').append(f.mtime));
		list.append(tr);
	}

	var elems = list.find('tr');
	elems.mousedown(function(e)
	{
		select_start = elems.index($(this));
		updateSelection(select_start, select_start);
		updateInfoBox(select_start, select_start);
		e.stopPropagation();
	});
	elems.mousemove(function(e)
	{
		if (select_start >= 0) {
			var index = elems.index($(this));
			updateSelection(select_start, index);
			updateInfoBox(select_start, index);
		}
	});
	elems.mouseup(function(e)
	{
		select_start = -1;
	});
	$('.filename').mousedown(function()
	{
		if ($(this).parent().parent().attr('class') == 'selected') {
			var filename = $(this).text();
			var index = elems.index($(this).parent().parent());

			updateSelection(index, index);
			$(this).css('display', 'none');

			var input = $('<input/>');
			input.attr('type', 'text');
			input.attr('class', 'change-name');
			input.attr('value', filename);

			input.blur(function(e)
			{
				renameClose(input);
			});
			input.mousedown(function(e)
			{
				e.stopPropagation();
			});
			input.keypress(function(e)
			{
				if (e.keyCode == 13) {
					renameFileList(input);
					renameClose(input);
				}
			});

			$(this).after(input);
			input.focus();
			rename_edit = true;
			return false;
		}
	});
}
function updateFileList()
{
	$.getJSON("list-json.php", null, function(json)
	{
		file_list = json;
		updateSortKey(sort_key, sort_reverce);
		refreshFileList();
		select_start = -1;
	});
}

function updateSelection(start, end)
{
	if (start > end) {
		var tmp = start;
		start = end;
		end = tmp;
	}

	var elems = $('#file-list tr');
	elems.each(function()
	{
		var index = elems.index($(this));
		if (start <= index && index <= end) {
			$(this).addClass('selected');
		} else {
			$(this).removeClass('selected');
		}
	});
}
function updateInfoBox(start, end)
{
	$('#info-preview').children().remove();

	if (start == -1) {
		$('#info-title').text("選択されていません");
		$('#info-download').css('display', 'none');
		$('#info-delete').css('display', 'none');
	} else if (start == end) {
		var f = file_list[start];
		var img;
		$('#info-title').text(f.filename);

		switch (f.icon) {
		case 'type-image.png':
			img = $('<img/>').attr('src', 'thumb/' + f.filename + '.png').attr('alt', '');
			$('#info-preview').append(img);
			break;
		}
		$('#info-download').css('display', '');
		$('#info-delete').css('display', '');
	} else {
		var num = start - end;
		if (num < 0)
			num = -num;
		$('#info-title').text((num + 1) + "個のファイル");
		$('#info-download').css('display', 'none');
		$('#info-delete').css('display', '');
	}
}
function updateSortKey(key, reverce)
{
	var gt, lt;
	var icon;
	if (reverce) {
		gt = -1;
		lt = 1;
		icon = 'url(icon/arrow_up.png)';
	} else {
		gt = 1;
		lt = -1;
		icon = 'url(icon/arrow_down.png)';
	}
	file_list.sort(function(a, b)
	{
		if (a[key] > b[key]) {
			return gt;
		} else if (a[key] < b[key]) {
			return lt;
		} else {
			return 0;
		}
	});
	$('#col-filename').css('background-image', key == 'filename' ? icon : '')
	$('#col-size').css('background-image', key == 'size' ? icon : '')
	$('#col-mtime').css('background-image', key == 'mtime' ? icon : '')
}

$(function()
{
	createDrop('upload', function(res) {
		updateFileList();
	});
	updateFileList();
	updateInfoBox(-1, -1);

	$('#upload').mousedown(function()
	{
		$('#file-list tr').removeClass('selected');
		select_start = -1;
		updateInfoBox(-1, -1);
	});
	$(window).keypress(function(e)
	{
		if (!rename_edit) {
			switch (e.keyCode) {
			case 46:
				deleteFileList();
				break;
			}
		}
	});
	$('#info-download').click(function()
	{
		var filename = $('#info-title').text();
		location.href = "down.php/" + encodeURIComponent(filename);
	});
	$('#info-delete').click(deleteFileList);


	$('#col-filename').click(function(e)
	{
		if (sort_key == 'filename') {
			sort_reverce = !sort_reverce;
		} else {
			sort_reverce = false;
			sort_key = 'filename';
		}
		updateSortKey(sort_key, sort_reverce);
		refreshFileList();
	});
	$('#col-size').click(function(e)
	{
		if (sort_key == 'size') {
			sort_reverce = !sort_reverce;
		} else {
			sort_reverce = false;
			sort_key = 'size';
		}
		updateSortKey(sort_key, sort_reverce);
		refreshFileList();
	});
	$('#col-mtime').click(function(e)
	{
		if (sort_key == 'mtime') {
			sort_reverce = !sort_reverce;
		} else {
			sort_reverce = false;
			sort_key = 'mtime';
		}
		updateSortKey(sort_key, sort_reverce);
		refreshFileList();
	});
});


