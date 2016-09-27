<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

$root = '/volume1/Studio-share/Marketing/2. Photo Galleries';
$root_length = strlen($root);

if(isset($_GET['image'])){
    $thumb = !isset($_GET['full']);
    serveImage($root, $_GET['image'], $thumb);
} else {
    serveImageList(getImageList($root));
}

function getImageList($root) {

    $most_files = array_merge(
        glob($root . '/**/**/**/*.{jpg,JPG}', GLOB_BRACE),
        glob($root . '/**/**/**/**/*.{jpg,JPG}', GLOB_BRACE)
    );

    sort($most_files);

    $most_files = array_reverse($most_files);

    $local_paths = array_map("local_path", $most_files);
    
    return $local_paths;
}

function local_path($fullpath) {
    global $root_length;
    return substr($fullpath, $root_length);
}

function serveImageList($list) {
    
    $json = json_encode(array("images" => $list));

    header("Content-Type: application/json; charset: UTF-8");
    echo $json;
}

function serveImage($root, $path, $thumb=false) {
    $file_path = $root . $path;
    $folder = dirname($file_path);
    $file_name = basename($file_path);
    $thumbs_dir = $folder . "/thumbs/";
    $thumb_path = $thumbs_dir . $file_name;
    if(file_exists($file_path)){
        if($thumb == false){
            serve_image_file($file_path);
        }
        else if(file_exists($thumb_path)) {
            serve_image_file($thumb_path);
        }
        else if(file_exists($file_path)){
            if(!file_exists($thumbs_dir)){
                mkdir($thumbs_dir);
            }
            make_thumb($file_path, $thumb_path, 300);
            serve_image_file($thumb_path);
        }
    }
    else {
        header("HTTP/1.1 404 Not Found");
        echo "Image does not exist";
    }
}

function serve_image_file($file_path) {
    header("Content-Type: image/jpeg");
    $date = new DateTime();
    $date->modify("+1 year");
    header("Expires: " . $date->format("r"));
    echo file_get_contents($file_path);
}

function make_thumb($src, $dest, $desired_width) {

	/* read the source image */
	$source_image = imagecreatefromjpeg($src);
	$width = imagesx($source_image);
	$height = imagesy($source_image);
	
	/* find the "desired height" of this thumbnail, relative to the desired width  */
	$desired_height = floor($height * ($desired_width / $width));
	
	/* create a new, "virtual" image */
	$virtual_image = imagecreatetruecolor($desired_width, $desired_height);
	
	/* copy source image at a resized size */
	imagecopyresampled($virtual_image, $source_image, 0, 0, 0, 0, $desired_width, $desired_height, $width, $height);
	
	/* save thumbnail to destination */
	imagejpeg($virtual_image, $dest);
}
