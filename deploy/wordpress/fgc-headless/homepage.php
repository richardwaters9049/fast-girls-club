<?php
if (!defined('ABSPATH')) exit;
require_once __DIR__ . '/homepage-policy.php';
function fgc_homepage_state(): array {
    return get_option('fgc_homepage', array('slots' => array(null, null, null), 'hidden' => array()));
}
function fgc_homepage_ids(array $state): array {
    $posts = get_posts(array('post_type' => 'post', 'post_status' => 'publish', 'has_password' => false,
        'numberposts' => -1, 'orderby' => array('date' => 'DESC', 'ID' => 'DESC'), 'fields' => 'ids'));
    return fgc_homepage_resolve($state, array_map('intval', $posts));
}
add_action('rest_api_init', function () {
    register_rest_route('fgc/v1', '/homepage', array('methods' => 'GET', 'permission_callback' => '__return_true',
        'callback' => static function () { return rest_ensure_response(array('post_ids' => fgc_homepage_ids(fgc_homepage_state()))); }));
});
add_action('add_meta_boxes_post', function () {
    add_meta_box('fgc-homepage', 'Homepage placement', 'fgc_homepage_box', 'post', 'side');
});
function fgc_homepage_box($post): void {
    $state = fgc_homepage_state();
    $placement = in_array($post->ID, $state['hidden'], true) ? 'hidden' : 'auto';
    foreach ($state['slots'] as $i => $id) if ($id === $post->ID) $placement = (string) $i;
    ?>
    <p><label for="fgc-placement">Display this article</label></p>
    <select id="fgc-placement">
    <?php foreach (array('auto' => 'Automatic — newest first', 'hidden' => 'Hide from homepage', '0' => 'Left', '1' => 'Middle', '2' => 'Right') as $value => $label): ?>
        <option value="<?php echo esc_attr($value); ?>" <?php selected($placement, (string) $value); ?>><?php echo esc_html($label); ?></option>
    <?php endforeach; ?>
    </select>
    <p>Only published articles appear. Save the article first, then save its placement. Empty positions use the latest articles.</p>
    <button type="button" class="button" id="fgc-save-placement" data-post="<?php echo (int) $post->ID; ?>" data-nonce="<?php echo esc_attr(wp_create_nonce('fgc_homepage')); ?>">Save homepage placement</button>
    <p id="fgc-placement-status" role="status" aria-live="polite"></p>
    <?php
}
add_action('admin_enqueue_scripts', function ($hook) {
    if (in_array($hook, array('post.php', 'post-new.php'), true) && get_current_screen()->post_type === 'post')
        wp_enqueue_script('fgc-homepage', plugins_url('homepage.js', __FILE__), array(), '0.2.0', true);
});
add_action('wp_ajax_fgc_homepage_save', function () {
    check_ajax_referer('fgc_homepage', 'nonce');
    $id = absint($_POST['post_id'] ?? 0);
    $placement = sanitize_text_field(wp_unslash($_POST['placement'] ?? ''));
    if (!current_user_can('edit_post', $id) || get_post_type($id) !== 'post') wp_send_json_error(array('message' => 'You cannot edit this article.'), 403);
    if (!in_array($placement, array('auto', 'hidden', '0', '1', '2'), true)) wp_send_json_error(array('message' => 'Choose a valid position.'), 400);
    if (in_array($placement, array('0', '1', '2'), true) && (get_post_status($id) !== 'publish' || get_post_field('post_password', $id) !== '')) wp_send_json_error(array('message' => 'Publish this article without a password before assigning a fixed homepage position.'), 400);
    // Serialize placement writes; never overwrite another editor's concurrent choice.
    if (!add_option('fgc_homepage_lock', time(), '', false)) {
        if ((int) get_option('fgc_homepage_lock') < time() - 30) delete_option('fgc_homepage_lock');
        wp_send_json_error(array('message' => 'Another editor is saving. Please try again.'), 409);
    }
    $state = fgc_homepage_state();
    $display = fgc_homepage_ids($state);
    $occupant = in_array($placement, array('0', '1', '2'), true) ? $display[(int) $placement] : null;
    $token = hash('sha256', wp_json_encode(array($state, $display)));
    if ($occupant && $occupant !== $id && !hash_equals($token, sanitize_text_field(wp_unslash($_POST['confirmation'] ?? '')))) {
        delete_option('fgc_homepage_lock');
        wp_send_json_error(array('replace' => true, 'token' => $token, 'message' => sprintf('Replace “%s” in this position? It will remain in the blog but be hidden from the homepage.', get_the_title($occupant))), 409);
    }
    if ($occupant && $occupant !== $id && !current_user_can('edit_post', $occupant)) {
        delete_option('fgc_homepage_lock');
        wp_send_json_error(array('message' => 'An editor with permission to edit the existing article must replace it.'), 403);
    }
    $next = fgc_homepage_change($state, $id, $placement, $occupant);
    if ($next !== $state && !update_option('fgc_homepage', $next, false)) {
        delete_option('fgc_homepage_lock');
        wp_send_json_error(array('message' => 'The placement could not be saved. Please try again.'), 500);
    }
    delete_option('fgc_homepage_lock');
    wp_send_json_success(array('message' => 'Homepage placement saved. Published changes appear on the website within a few minutes.'));
});
