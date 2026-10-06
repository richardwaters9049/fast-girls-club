<?php
// Exercise the actual registered filter with WordPress API stubs.
define('ABSPATH', __DIR__);
$filters = array();
$mode = 'test'; $host = 'https://cms.fastgirlsclub.co.uk/'; $feed = true;
function add_action(...$args): void {}
function add_filter($name, $callback, ...$args): void { global $filters; $filters[$name] = $callback; }
function get_option($name, $default = null) { global $mode; return $name === 'fgc_headless_mode' ? $mode : $default; }
function home_url($path) { global $host; return $host; }
function wp_parse_url($url, $component) { return parse_url($url, $component); }
function is_feed(): bool { global $feed; return $feed; }
require __DIR__ . '/fgc-headless/fgc-headless.php';
$filter = $filters['wp_headers'];
$original = array('Content-Type' => 'application/rss+xml');
function verify($actual, $expected): void { if ($actual !== $expected) { fwrite(STDERR, "Feed header check failed\n"); exit(1); } }
foreach (array('test', 'live') as $mode) verify($filter($original), $original + array('X-Robots-Tag' => 'noindex, follow'));
$mode = 'off'; verify($filter($original), $original);
$mode = 'live'; $feed = false; verify($filter($original), $original);
$feed = true; $host = 'https://fastgirlsclub.co.uk/'; verify($filter($original), $original);
echo "5 feed header checks passed\n";
