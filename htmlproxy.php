<?php

//lookup file to proxy
$callback = 'callback';
if (isset($_REQUEST['callback'])) $callback = $_REQUEST['callback'];

$url = '';
if (isset($_REQUEST['url'])) $url = $_REQUEST['url'];

//retrieve file
$text = curl_file_get_contents($url);
$text = str_replace("\n", "", $text);
$text = str_replace("\r", "", $text);
$text = str_replace("'", "\'", $text);

//construct response
$out = "'$text'";

//send response
header("Content-type: text/javascript");
header("Cache-Control: max-age=600");
echo $out;


function curl_file_get_contents($url) {
	$c = curl_init();
	curl_setopt($c, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($c, CURLOPT_URL, $url);
	$contents = curl_exec($c);
	curl_close($c);

	if ($contents) return $contents;
	return '';
}
?>