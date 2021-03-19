<?php 
$file = $_REQUEST['imageUrl'];

//Check the scheme ://, http:// or https:// followed by a valid hostname name start
$validHTTPURLBegin = '/^(:|http(s?):)\/\/[\w]+/';
if (!preg_match($validHTTPURLBegin, $file)) {
    die('File is not a valid URL');
}

// Set headers
header("Cache-Control: public");
header("Content-Description: File Transfer");
header("Content-Disposition: attachment; filename=$file");
header("Content-Type: image/gif");
header("Content-Transfer-Encoding: binary");
// Read the file from disk
readfile($file);

?>