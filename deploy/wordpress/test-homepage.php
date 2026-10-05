<?php
require __DIR__ . '/fgc-headless/homepage-policy.php';
function check($actual, $expected) { if ($actual !== $expected) { throw new Exception(json_encode(array($actual, $expected))); } }
$empty = array('slots' => array(null,null,null), 'hidden' => array());
check(fgc_homepage_resolve($empty, array(4,3,2,1)), array(4,3,2));
$state = fgc_homepage_change($empty, 1, '2', 2);
check(fgc_homepage_resolve($state, array(4,3,2,1)), array(4,3,1));
check($state['hidden'], array(2));
$state = fgc_homepage_change($state, 1, '0', 4);
check(fgc_homepage_resolve($state, array(4,3,2,1)), array(1,3,null));
$state = fgc_homepage_change($state, 1, 'hidden', null);
check(fgc_homepage_resolve($state, array(4,3,2,1)), array(3,null,null));
$state = fgc_homepage_change($state, 2, 'auto', null);
check(fgc_homepage_resolve($state, array(4,3,2,1)), array(3,2,null));
check(fgc_homepage_resolve(array('slots'=>array(99,null,1),'hidden'=>array()), array(4,3,2,1)), array(4,3,1));
check(fgc_homepage_resolve(array('slots'=>array(1,1,1),'hidden'=>array()), array(4,3,2,1)), array(1,4,3));
echo "Homepage policy checks passed\n";
