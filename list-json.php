<?php

function get_icon($name)
{
	if (preg_match('/\\.([^\\.]+)$/', $name, $m)) {
		switch (strtolower($m[1])) {
		case 'jpg': case 'jpeg': case 'gif': case 'png':
			return 'type-image.png';
		case 'zip': case 'lzh': case 'gz':
			return 'type-archive.png';
		case 'txt':
			return 'type-text.png';
		}
	}
	return 'type-binary.png';
}
function size_fmt($n)
{
	if ($n < 1024)
		return $n;
	$n /= 1024;
	if ($n < 1024)
		return sprintf("%.1fK", $n);
	$n /= 1024;
	if ($n < 1024)
		return sprintf("%.1fM", $n);
	$n /= 1024;
	return sprintf("%.1fG", $n);
}

$a = array();
$d = opendir('files');
while (($f = readdir($d)) !== false) {
	if ($f[0] !== '.') {
		$m = array();

		$m['filename'] = $f;
		$size = filesize('files/'.$f);
		$m['size'] = $size;
		$m['size_fmt'] = size_fmt($size)."B";
		$m['mtime'] = date('Y-m-d H:i:s', filemtime('files/'.$f));
		$m['icon'] = get_icon($f);

		$a[] = $m;
	}
}
closedir($d);

header('Content-Type: application/json');
echo json_encode($a);
