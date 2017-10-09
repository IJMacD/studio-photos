<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

$root = '/volume1/Studio-share/Marketing/2. Photo Galleries';
$root_length = strlen($root);

if(isset($_GET['image'])){
    $thumb = !isset($_GET['full']);
    serveImage($root, $_GET['image'], $thumb);
} else {
    printImageList(getImageList($root));
}

function getImageList($root) {

    $most_files = array_merge(
        glob($root . '/**/**/**/*.{jpg,JPG,jpeg}', GLOB_BRACE),
        glob($root . '/**/**/**/**/*.{jpg,JPG,jpeg}', GLOB_BRACE),
        glob($root . '/**/**/**/**/**/*.{jpg,JPG,jpeg}', GLOB_BRACE)
    );

    $most_files = array_filter($most_files, "image_is_not_thumb");

    sort($most_files);

    $most_files = array_reverse($most_files);

    $local_paths = array_map("local_path", $most_files);
    
    return $local_paths;
}

function local_path($fullpath) {
    // TODO: woops! bad global variable
    global $root_length;
    return substr($fullpath, $root_length);
}

function image_is_not_thumb($path) {
    return strpos($path, "/thumbs/") === false;
}

function printImageList($list) {
    
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
            make_thumb($file_path, $thumb_path, 150);
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

function make_thumb($src, $dest, $desired_size) {

	/* read the source image */
	$source_image = imagecreatefromjpeg($src);
	$width = imagesx($source_image);
	$height = imagesy($source_image);
    $xOffset = 0;
    $yOffset = 0;
    $scaledWidth = $width;
    $scaledHeight = $height;
    $ratio = $height / $width;

    $desired_height = $desired_size;
    $desired_width = $desired_size;

    // TODO: Accomodate different target ratios
    if($ratio < 1) {
        // Landscape photo
        $scale = $desired_height / $height;
        $scaledWidth = $desired_width / $scale;
        $xOffset = ($width - $scaledWidth) / 2;
    }
	else {
        // Portrait Photo
        $scale = $desired_width / $width;
        $scaledHeight = $desired_height / $scale;
        $yOffset = ($height - $scaledHeight) / 2;
    }
	
	/* create a new, "virtual" image */
	$virtual_image = imagecreatetruecolor($desired_width, $desired_height);
	
	/* copy source image at a resized size */
	// imagecopyresized($virtual_image, $source_image, 0, 0, $xOffset, $yOffset, $desired_width, $desired_height, $scaledWidth, $scaledHeight);
	imagecopyresampled($virtual_image, $source_image, 0, 0, $xOffset, $yOffset, $desired_width, $desired_height, $scaledWidth, $scaledHeight);
	
	/* save thumbnail to destination */
	imagejpeg($virtual_image, $dest);
}
