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

function roomful_editor_scripts_enqueue()
{
    if (stripos($_SERVER['REQUEST_URI'], 'post.php') === FALSE
        && stripos($_SERVER['REQUEST_URI'], 'post-new.php') === FALSE) return;

    wp_register_script('roomful', _get_plugin_url() . '/js/editor.js', array('jquery'), '0.0.1');
    wp_register_style('roomful', _get_plugin_url() . '/css/editor.css', array(), '0.0.1');

    wp_enqueue_script('roomful');
    wp_enqueue_style('awesome-font', 'https://use.fontawesome.com/releases/v5.1.1/css/all.css', array(), '5.1.1');
    wp_enqueue_style('roomful');
}

function roomful_shortCode($attributes, $content = '')
{
    $attributes = shortcode_atts(
        array(
            'type' => 'iframe',
            'host' => 'my',
            'room' => '',
            'width' => 960,
            'height' => 620,
            'autoPlay' => 'false',
            'autoChat' => 'false',
            'needAuth' => 'false',
            'isLight' => 'true',
            'ytVideo' => '',
        ), $attributes
    );

    $query = '';
    if ($attributes['autoPlay'] !== 'false') $query .= (($query === '') ? '?' : '&') . 'autoplay=1';
    if ($attributes['needAuth'] !== 'false') $query .= (($query === '') ? '?' : '&') . 'auth=1';
    if ($attributes['ytVideo'] !== '') $query .= (($query === '') ? '?' : '&') . 'v=' . esc_attr($attributes['ytVideo']);
    if ($attributes['host'] !== 'my' && $attributes['isLight'] === 'true') {
        $query .= (($query === '') ? '?' : '&') . 'light=1';
    } else if ($attributes['host'] === 'my' && $attributes['isLight'] === 'false') {
        $query .= (($query === '') ? '?' : '&') . 'light=0';
    }

    $embedCode = '';
    if ($attributes['type'] === 'iframe') {
        $embedCode = '<iframe src="https://' . esc_attr($attributes['host']) . '.roomful.net/'
            . ($query !== '' ? $query : '') . '#/room/' . esc_attr($attributes['room'])
            . ($attributes['autoChat'] ? '/chat' : '')
            . '" allow="autoplay; microphone; camera" frameborder="0"
         width="' . esc_attr($attributes['width']) . '" height="' . esc_attr($attributes['height']) . '"></iframe>';
    } else if ($attributes['type'] === 'link' && $content === '') {
        $embedCode = '<a href="https://' . esc_attr($attributes['host']) . '.roomful.net/'
            . ($query !== '' ? $query : '') . '#/room/' . esc_attr($attributes['room'])
            . ($attributes['autoChat'] ? '/chat' : '')
            . '" target="_blank" title="Open Roomful">'
            . '<img src="https://demo.roomful.co:3443/api/v0/resource/thumbnail/room/' .
            esc_attr($attributes['room']) . '" width="' . esc_attr($attributes['width'])
            . '" height="' . esc_attr($attributes['height']) . '"/></a>';
    } else if ($attributes['type'] === 'link' && $content !== '') {
        $embedCode = '<a href="https://' . esc_attr($attributes['host']) . '.roomful.net/'
            . ($query !== '' ? $query : '') . '#/room/' . esc_attr($attributes['room'])
            . ($attributes['autoChat'] ? '/chat' : '')
            . '" target="_blank" title="Open Roomful">' . $content . '</a>';
    }

    return $embedCode;
}

function roomful_add_media_button()
{
    if (stripos($_SERVER['REQUEST_URI'], 'post.php') !== FALSE ||
        stripos($_SERVER['REQUEST_URI'], 'post-new.php') !== FALSE ||
        isset($_POST['action']) && $_POST['action'] == 'vc_edit_form'
    ) {
        $tip = 'Add Roomful';
        $icon = '<span></span>';

        echo '<a title="' . __('Add Roomful', 'roomful-wordpress') . '" title="' . $tip
            . '" href="#TB_inline?w=1&inlineId=roomful_insert_popup&width=780&height=470" class="thickbox button roomful-wordpress-button" >'
            . $icon . ' Roomful</a>';
    }
}

function roomful_insert_popup()
{
    if (stripos($_SERVER['REQUEST_URI'], 'post.php') === FALSE
        && stripos($_SERVER['REQUEST_URI'], 'post-new.php') === FALSE) return;

    add_thickbox();

    echo file_get_contents(__DIR__ . '/html/editor.html');
}

function wp_embed_handler_roomful($matches, $attributes, $url, $raw)
{
    $query = $matches[2] ? esc_attr(stripcslashes($matches[2])) : '';

    //var_dump($query);

    $href = "https://" . esc_attr($matches[1]) . ".roomful.net" . $query;
    $embed = '<iframe src="' . $href
        . '" allow="autoplay; microphone; camera" frameborder="0"  width="960" height="620"></iframe>';
    return apply_filters('embed_roomful', $embed, $matches, $attributes, $url, $raw);
}

/*
function roomful_media_menu($tabs)
{
    return array_merge($tabs, array('my_custom_tab' => __('Roomful')));
}

add_filter('media_upload_tabs', 'roomful_media_menu');
*/

add_action('admin_enqueue_scripts', 'roomful_editor_scripts_enqueue');
add_action('admin_footer', 'roomful_insert_popup', 100);
add_action('media_buttons', 'roomful_add_media_button', 10);

add_shortcode('roomful', 'roomful_shortCode');
wp_embed_register_handler('roomful', '#^https:\/\/(:?my|beta|omega|zeta)\.roomful\.net(.+)$#i', 'wp_embed_handler_roomful');
?>
