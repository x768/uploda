<?php

define('FILENAME', "/^[^\\.\\/][^\\/]*$/");
define('THUMB_SIZE', 200);

$name = substr($_SERVER['PATH_INFO'], 1);


function create_thumbnail($name, $type)
{
	switch ($type) {
	case 'png':
		$img = imagecreatefrompng('files/'.$name);
		break;
	case 'jpg': case 'jpeg':
		$img = imagecreatefromjpeg('files/'.$name);
		break;
	case 'gif':
		$img = imagecreatefromgif('files/'.$name);
		break;
	default:
		return;
	}
	$w1 = imagesx($img);
	$h1 = imagesy($img);
	$w2 = THUMB_SIZE;
	$h2 = THUMB_SIZE;

	if ($w1 > $h1) {
		$h2 = $h1 * THUMB_SIZE / $w1;
	} else if ($w1 < $h1) {
		$w2 = $w1 * THUMB_SIZE / $h1;
	}
	$thumb = imagecreatetruecolor($w2, $h2);
	imagecopyresampled($thumb, $img, 0, 0, 0, 0, $w2, $h2, $w1, $h1);

	imagepng($thumb, "thumb/".$name.".png");
	imagedestroy($img);
	imagedestroy($thumb);
}

if (!is_dir("files")) {
	mkdir("files");
}
if (!is_dir("thumb")) {
	mkdir("thumb");
}

if (preg_match(FILENAME, $name)) {
	$ext = '';
	if (preg_match("/\\.([^\\.]+)$/", $name, $m)) {
		$ext = $m[1];
	}

	$fp = fopen('php://input', 'r');
	file_put_contents("files/".$name, $fp);

	switch (strtolower($ext)) {
	case 'png': case 'jpg': case 'jpeg': case 'gif':
		create_thumbnail($name, $ext);
		break;
	}
	echo "OK";
} else {
	echo "fault";
}
