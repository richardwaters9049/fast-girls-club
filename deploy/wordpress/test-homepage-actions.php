<?php
// Exercise the AJAX action with in-memory WordPress adapters, including permissions and stale confirmations.
define('ABSPATH', __DIR__);
$actions = array(); $options = array(); $published = array(238,234,230,122); $allowed = true;
function add_action($name,$callback) { global $actions; $actions[$name]=$callback; }
function get_option($key,$default=false) { global $options; return $options[$key] ?? $default; }
function add_option($key,$value,...$args) { global $options; if(isset($options[$key])) return false; $options[$key]=$value; return true; }
function update_option($key,$value,...$args) { global $options; $options[$key]=$value; return true; }
function delete_option($key) { global $options; unset($options[$key]); }
function get_posts($args) { global $published; return $published; }
function check_ajax_referer(...$args) {}
function absint($value) { return abs((int)$value); }
function sanitize_text_field($value) { return (string)$value; }
function wp_unslash($value) { return $value; }
function current_user_can(...$args) { global $allowed; return $allowed; }
function get_post_type($id) { return $id ? 'post' : false; }
function get_post_status($id) { global $published; return in_array($id,$published,true) ? 'publish' : 'draft'; }
function get_post_field(...$args) { return ''; }
function wp_json_encode($value) { return json_encode($value); }
function get_the_title($id) { return 'Story '.$id; }
class ResponseResult extends Exception { public $data; public $status; function __construct($data,$status){ $this->data=$data; $this->status=$status; } }
function wp_send_json_error($data,$status) { throw new ResponseResult($data,$status); }
function wp_send_json_success($data) { throw new ResponseResult($data,200); }
require __DIR__.'/fgc-headless/homepage.php';
function request($post,$placement,$token='') { global $actions; $_POST=array('post_id'=>$post,'placement'=>$placement,'confirmation'=>$token); try { $actions['wp_ajax_fgc_homepage_save'](); } catch(ResponseResult $r){ return $r; } throw new Exception('Missing response'); }
function check($condition) { if(!$condition) throw new Exception('Homepage action assertion failed'); }
$allowed=false; check(request(122,'0')->status===403); $allowed=true;
check(request(122,'invalid')->status===400);
check(request(99,'0')->status===400);
$r=request(122,'0'); check($r->status===409 && $r->data['replace']);
check(!isset($options['fgc_homepage'])); check(!isset($options['fgc_homepage_lock']));
$token=$r->data['token'];
$options['fgc_homepage']=array('slots'=>array(null,null,null),'hidden'=>array(238));
check(request(122,'0',$token)->status===409); // occupant changed while the dialog was open
$r=request(122,'0'); check(request(122,'0',$r->data['token'])->status===200);
check(fgc_homepage_ids(fgc_homepage_state())===array(122,230,null));
check(in_array(234,$options['fgc_homepage']['hidden'],true));
check(request(122,'auto')->status===200);
check(fgc_homepage_ids(fgc_homepage_state())===array(230,122,null));
echo "Homepage AJAX checks passed\n";
