<?php
/**
 * Plugin Name: Fast Girls Club Headless
 * Description: Controlled public-page redirects from the CMS to the Next.js publication.
 * Version: 0.2.1
 * Requires PHP: 7.4
 * License: GPL-2.0-or-later
 */
if (!defined('ABSPATH')) exit;
require_once __DIR__ . '/routes.php';
require_once __DIR__ . '/homepage.php';

function fgc_headless_mode(): string {
    if (defined('FGC_HEADLESS_DISABLED') && FGC_HEADLESS_DISABLED) return 'off';
    $mode = get_option('fgc_headless_mode', 'off');
    return in_array($mode, array('test', 'live'), true) ? $mode : 'off';
}

function fgc_headless_protected_request(): bool {
    return is_admin() || wp_doing_ajax() || wp_doing_cron()
        || (defined('REST_REQUEST') && REST_REQUEST)
        || (defined('XMLRPC_REQUEST') && XMLRPC_REQUEST)
        || is_user_logged_in() || is_preview() || is_customize_preview()
        || is_feed() || is_trackback() || is_embed()
        || is_robots() || is_favicon()
        || isset($_GET['preview']) || isset($_GET['preview_id'])
        || isset($_GET['preview_nonce']) || isset($_GET['rest_route'])
        || isset($_GET['sitemap']) || isset($_GET['sitemap_n']);
}

// Preserve RSS delivery while keeping full-text CMS feeds out of search results.
add_filter('wp_headers', function (array $headers): array {
    if (fgc_headless_mode() !== 'off'
        && strtolower((string) wp_parse_url(home_url('/'), PHP_URL_HOST)) === 'cms.fastgirlsclub.co.uk'
        && is_feed()) {
        $headers['X-Robots-Tag'] = 'noindex, follow';
    }
    return $headers;
});

add_action('template_redirect', function () {
    $mode = fgc_headless_mode();
    $host = strtolower((string) wp_parse_url(home_url('/'), PHP_URL_HOST));
    $method = $_SERVER['REQUEST_METHOD'] ?? '';
    if ($mode === 'off' || $host !== 'cms.fastgirlsclub.co.uk'
        || !in_array($method, array('GET', 'HEAD'), true)
        || fgc_headless_protected_request()) return;

    // Only CMS HTML responses; REST, direct media and administration bypass this.
    header('X-Robots-Tag: noindex, follow', true);
    nocache_headers();
    $post = get_queried_object();
    $kind = 'other';
    if (is_singular('post')) $kind = 'post';
    elseif (is_front_page()) $kind = 'front';
    elseif (is_home()) $kind = 'posts';
    elseif (is_page('about')) $kind = 'about';
    $destination = fgc_headless_destination(array(
        'mode' => $mode, 'cms_host' => $host, 'method' => $method,
        'kind' => $kind, 'slug' => $post->post_name ?? '',
        'status' => $post->post_status ?? '',
        'password' => $post->post_password ?? '',
    ));
    if (!$destination) return;
    $allow = static function (array $hosts): array {
        $hosts[] = 'fastgirlsclub.co.uk';
        return array_unique($hosts);
    };
    add_filter('allowed_redirect_hosts', $allow);
    $redirected = wp_safe_redirect($destination, $mode === 'live' ? 301 : 302, 'Fast Girls Club');
    remove_filter('allowed_redirect_hosts', $allow);
    if ($redirected) exit;
}, 1);

add_action('admin_init', function () {
    register_setting('fgc_headless', 'fgc_headless_mode', array(
        'type' => 'string', 'default' => 'off',
        'sanitize_callback' => static function ($value): string {
            return in_array($value, array('off', 'test', 'live'), true) ? $value : 'off';
        },
    ));
});
add_action('admin_menu', function () {
    add_options_page('Fast Girls Club', 'Fast Girls Club', 'manage_options', 'fgc-headless', 'fgc_headless_settings');
});
function fgc_headless_settings(): void {
    if (!current_user_can('manage_options')) return;
    ?>
    <div class="wrap">
        <h1>Fast Girls Club — public article routing</h1>
        <p>Destination: <code>https://fastgirlsclub.co.uk</code>. Only the CMS site is affected.</p>
        <p><strong>Keep Off until the public Next.js homepage and published articles work.</strong>
        Localhost cannot receive public visitors. Test in a signed-out browser.</p>
        <p>Editors, previews, REST, feeds and media retain their existing behaviour.
        Unmapped HTML pages and RSS feeds receive a noindex header when enabled.</p>
        <form method="post" action="options.php">
            <?php settings_fields('fgc_headless'); ?>
            <label for="fgc_headless_mode">Redirect mode</label>
            <select id="fgc_headless_mode" name="fgc_headless_mode">
                <?php foreach (array('off' => 'Off', 'test' => 'Test — temporary 302', 'live' => 'Live — permanent 301') as $value => $label): ?>
                    <option value="<?php echo esc_attr($value); ?>" <?php selected(get_option('fgc_headless_mode', 'off'), $value); ?>><?php echo esc_html($label); ?></option>
                <?php endforeach; ?>
            </select>
            <?php submit_button(); ?>
        </form>
        <p>Rollback: select Off or deactivate this plugin, then purge Pressable caches.
        Previously cached permanent redirects may persist in browsers.</p>
    </div>
    <?php
}
