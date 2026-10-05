<?php
/** Resolve fixed editorial slots, then fill empty slots newest first. */
function fgc_homepage_resolve(array $state, array $published): array {
    $slots = array(null, null, null);
    $hidden = $state['hidden'] ?? array();
    foreach (($state['slots'] ?? array()) as $i => $id) {
        if ($i < 3 && in_array($id, $published, true) && !in_array($id, $hidden, true) && !in_array($id, $slots, true)) $slots[$i] = $id;
    }
    $available = array_values(array_diff($published, $hidden, $slots));
    foreach ($slots as $i => $id) if (!$id) $slots[$i] = array_shift($available);
    return $slots;
}
function fgc_homepage_change(array $state, int $id, string $placement, ?int $replaced): array {
    $slots = $state['slots'];
    foreach ($slots as $i => $value) if ($value === $id) $slots[$i] = null;
    $hidden = array_values(array_diff($state['hidden'], array($id)));
    if ($placement === 'hidden') $hidden[] = $id;
    if (in_array($placement, array('0', '1', '2'), true)) {
        $slots[(int) $placement] = $id;
        // A replaced story stays in the blog, but does not resurface in another slot.
        if ($replaced && $replaced !== $id) {
            foreach ($slots as $i => $value) if ($i !== (int) $placement && $value === $replaced) $slots[$i] = null;
            $hidden[] = $replaced;
        }
    }
    return array('slots' => $slots, 'hidden' => array_values(array_unique($hidden)));
}
