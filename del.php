<?php

define('FILENAME', "/^[^\\.\\/][^\\/]*$/");

$files = explode('/', file_get_contents('php://input'));

foreach ($files as $f)
{
	if (preg_match(FILENAME, $f)) {
		if (is_file("files/".$f)) {
			unlink("files/".$f);
		}
		if (is_file("thumb/".$f.".png")) {
			unlink("thumb/".$f.".png");
		}
	}
}
echo 'OK';
