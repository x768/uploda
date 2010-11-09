<?php

define('FILENAME', "/^[^\\.\\/][^\\/]*$/");

$files = explode('/', file_get_contents('php://input'));

if (count($files) != 2)
	exit;

$src = $files[0];
$dst = $files[1];

if (!preg_match(FILENAME, $src) || !preg_match(FILENAME, $dst)) {
	exit;
}

if (is_file("files/".$src) && !file_exists("files/".$dst)) {
	rename("files/".$src, "files/".$dst);
}
if (is_file("thumb/".$src.".png") && !file_exists("thumb/".$dst.".png")) {
	rename("thumb/".$src.".png", "thumb/".$dst.".png");
}

echo 'OK';
