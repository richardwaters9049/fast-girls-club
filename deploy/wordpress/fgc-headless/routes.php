<?php
/** Pure routing policy, independently testable without a WordPress install. */
function fgc_headless_destination(array $context): ?string {
    if (!in_array($context['mode'] ?? 'off', array('test', 'live'), true)
        || ($context['cms_host'] ?? '') !== 'cms.fastgirlsclub.co.uk'
        || !in_array($context['method'] ?? '', array('GET', 'HEAD'), true)
        || !empty($context['protected'])) return null;
    $origin = 'https://fastgirlsclub.co.uk';
    switch ($context['kind'] ?? '') {
        case 'post':
            if (($context['status'] ?? '') !== 'publish' || !empty($context['password'])) return null;
            $slug = $context['slug'] ?? '';
            if (!is_string($slug) || $slug === '') return null;
            return $origin . '/blog/' . rawurlencode(rawurldecode($slug));
        case 'front': return $origin . '/';
        case 'posts': return $origin . '/blog';
        case 'about': return $origin . '/about';
        default: return null;
    }
}
