<?php

define('FILENAME', "/^[^\\.\\/][^\\/]*$/");

$name = substr($_SERVER['PATH_INFO'], 1);

if (preg_match(FILENAME, $name)) {
	header('Content-Type: application/octet-stream');
	header('Content-Length: '.filesize("files/".$name));

	readfile("files/".$name);
} else {
	echo "fault";
}

