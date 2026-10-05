<?php
require __DIR__ . '/fgc-headless/routes.php';
$count = 0;
function check($actual, $expected, string $name): void {
    global $count;
    if ($actual !== $expected) { fwrite(STDERR, "FAIL: $name\n"); exit(1); }
    $count++;
}
$base = array('mode' => 'test', 'cms_host' => 'cms.fastgirlsclub.co.uk', 'method' => 'GET',
    'kind' => 'post', 'status' => 'publish', 'slug' => 'race-report');
$url = 'https://fastgirlsclub.co.uk/blog/race-report';
check(fgc_headless_destination($base), $url, 'published post');
foreach (array('off', 'invalid') as $mode)
    check(fgc_headless_destination(array_replace($base, array('mode' => $mode))), null, 'disabled');
foreach (array('draft', 'private', 'future', 'trash') as $status)
    check(fgc_headless_destination(array_replace($base, array('status' => $status))), null, 'unpublished');
foreach (array('POST', 'PUT', 'DELETE') as $method)
    check(fgc_headless_destination(array_replace($base, array('method' => $method))), null, 'write request');
check(fgc_headless_destination(array_replace($base, array('method' => 'HEAD'))), $url, 'head');
check(fgc_headless_destination(array_replace($base, array('protected' => true))), null, 'protected');
check(fgc_headless_destination(array_replace($base, array('password' => 'secret'))), null, 'password');
check(fgc_headless_destination(array_replace($base, array('cms_host' => 'fastgirlsclub.co.uk'))), null, 'loop prevention');
foreach (array('front' => '/', 'posts' => '/blog', 'about' => '/about') as $kind => $path)
    check(fgc_headless_destination(array_replace($base, array('kind' => $kind))), 'https://fastgirlsclub.co.uk' . $path, $kind);
check(fgc_headless_destination(array_replace($base, array('kind' => 'other'))), null, 'no blanket redirect');
check(fgc_headless_destination(array_replace($base, array('slug' => 'guide-%f0%9f%8f%8e'))), 'https://fastgirlsclub.co.uk/blog/guide-%F0%9F%8F%8E', 'emoji');
check(fgc_headless_destination(array_replace($base, array('slug' => 'x?next=https://evil.test'))), 'https://fastgirlsclub.co.uk/blog/x%3Fnext%3Dhttps%3A%2F%2Fevil.test', 'destination fixed');
echo "$count routing checks passed\n";
