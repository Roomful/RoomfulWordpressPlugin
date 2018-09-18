<?php
/*
Plugin Name: Roomful
Plugin URI: http://github.com/Roomful
Description: Roomful plugin for wordpress
Version: 0.0.1
Author: Dimitriy Kalugin
Author URI: http://github.com/devinterx
Text Domain: roomful
*/

if (!defined('ABSPATH')) {
    exit;
}

function _get_plugin_url()
{
    return (stripos(__FILE__, '/themes/') !== false || stripos(__FILE__, '\\themes\\') !== false)
        ? get_template_directory_uri() . '/roomful'
        : plugins_url(basename(dirname(__FILE__)));
}

function roomful_editor_scripts_enqueue($page)
{
    if ($page !== 'post.php' && $page !== 'post-new.php' && (empty($_GET['page']))) {
        return;
    }

    wp_register_script('roomful-js', _get_plugin_url() . '/js/editor.js', array('jquery'), '0.0.1');
    wp_register_style('roomful-css', _get_plugin_url() . '/css/editor.css', array(), '0.0.1');

    wp_enqueue_script('roomful-js');
    wp_enqueue_style('roomful-css');
}

function roomful_shortCode($attributes)
{
    $attributes = shortcode_atts(
        array(
            'type' => 'frame',
            'host' => 'my',
            'room' => '',
            'width' => 960,
            'height' => 620,
            'autoPlay' => 'false',
            'autoChat' => 'false',
            'needAuth' => 'false',
            'ytVideo' => '',
        ), $attributes
    );

    $query = '';
    if ($attributes['autoPlay'] !== 'false') $query .= (($query === '') ? '?' : '&') . 'autoplay=1';
    if ($attributes['needAuth'] !== 'false') $query .= (($query === '') ? '?' : '&') . 'auth=1';
    if ($attributes['ytVideo'] !== '') $query .= (($query === '') ? '?' : '&') . 'v=' . esc_attr($attributes['ytVideo']);
    if ($attributes['host'] !== 'my.roomful.net') $query .= (($query === '') ? '?' : '&') . 'light=1';

    $embedCode = '<iframe src="https://' . esc_attr($attributes['host']) . '.roomful.net/'
        . ($query !== '' ? $query : '') . '#/room/' . esc_attr($attributes['room'])
        . ($attributes['autoChat'] ? '/chat' : '')
        . '" allow="autoplay; microphone; camera" frameborder="0"
         width="' . esc_attr($attributes['width']) . '" height="' . esc_attr($attributes['height']) . '"></iframe>';

    return $embedCode;
}

function roomful_add_media_button()
{
    if (stripos($_SERVER['REQUEST_URI'], 'post.php') !== FALSE ||
        stripos($_SERVER['REQUEST_URI'], 'post-new.php') !== FALSE ||
        isset($_POST['action']) && $_POST['action'] == 'vc_edit_form'
    ) {
        $tip = 'Insert a video';
        $icon = '<span></span>';

        echo '<a title="' . __('Add Roomful', 'roomful-wordpress') . '" title="' . $tip . '" href="#" class="button froomful-wordpress-button" >' . $icon . ' Roomful</a>';
    }
}

//function roomful_media_menu($tabs)
//{
//    return array_merge($tabs, array('my_custom_tab' => __('Roomful')));
//}

function wp_embed_handler_roomful($matches, $attributes, $url, $raw)
{
    $query = "https://" . esc_attr($matches[1]) . ".roomful.net" . ($matches[2] ? esc_attr(stripcslashes($matches[2])) : '');
    $embed = '<iframe src="' . $query . '" allow="autoplay; microphone; camera" frameborder="0"  width="960" height="620"></iframe>';
    return apply_filters('embed_roomful', $embed, $matches, $attributes, $url, $raw);
}

add_action('admin_enqueue_scripts', 'roomful_editor_scripts_enqueue');
add_action('media_buttons', 'roomful_add_media_button', 10);
//add_filter('media_upload_tabs', 'roomful_media_menu');

add_shortcode('roomful', 'roomful_shortCode');
add_action('init', 'roomful_oembed_provider');
wp_embed_register_handler('roomful', '#^https:\/\/(:my|beta|omega|zeta)\.roomful\.net(.+)$#i', 'wp_embed_handler_roomful');
?>
