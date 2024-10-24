<?php
/**
 * Plugin Name:       ACF Field Block
 * Description:       A simple block that show ACF Field .
 * Requires at least: 5.8
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            Lengin
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       acf_field_block
 *
 * @package           create-block
 */

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */

// function for registering gutenberg block
function create_block_acf_field_block_init() {
	register_block_type( __DIR__ . '/build', array(
		'render_callback' => 'render_acf_field_block'
	) );
}
add_action( 'init', 'create_block_acf_field_block_init' );

// function for server-side rendering block
function render_acf_field_block($attributes, $content, $block){  
   ob_start();
   $wrapper_attr = get_block_wrapper_attributes();
   $post_id = $attributes['postId'] != 0 ? $attributes['postId'] : get_the_id();
   $acf_field = $attributes['acfField'];

   if($acf_field && $post_id) { ?>
        <p <?php echo $wrapper_attr; ?>>
            <?php echo get_field($acf_field, $post_id) ?>
        </p>
    <?php
    } else {
        echo '<p>' . __('Select needed ACF Field in the settings.', 'lengin') . '</p>';
    }

   return ob_get_clean();
}


// Register REST API endpoint to get ACF fields
add_action('rest_api_init', function () {
    register_rest_route('simple/v1', '/acf-fields/(?P<id>\d+)', array(
        'methods' => 'GET',
        'callback' => 'get_acf_fields_for_post',
        'permission_callback' => '__return_true'
    ));
});

function get_acf_fields_for_post($data) {
    $post_id = $data['id'];
    if (!$post_id || !function_exists('get_field_objects')) {
        return [];
    }

    $acf_fields = get_field_objects($post_id);
    if (!$acf_fields) {
        return [];
    }

    $fields = [];
    foreach ($acf_fields as $field) {
        $fields[] = [
            'label' => $field['label'],
            'name' => $field['name'],
        ];
    }

    return [
        'fields' => $fields,
    ];
}