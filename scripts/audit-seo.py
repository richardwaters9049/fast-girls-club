#!/usr/bin/env python3
"""Read-only production SEO regression crawl; no credentials or extra dependencies."""
import concurrent.futures
import json
import sys
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from html.parser import HTMLParser

BASE = 'https://fastgirlsclub.co.uk'

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.canonical, self.robots, self.h1, self.schema = [], [], 0, []
        self.title, self.description, self.in_title, self.in_schema = '', '', False, False
        self.schema_text = ''
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'link' and a.get('rel') == 'canonical': self.canonical.append(a.get('href'))
        if tag == 'meta' and a.get('name') == 'robots': self.robots.append(a.get('content'))
        if tag == 'meta' and a.get('name') == 'description': self.description = a.get('content', '')
        if tag == 'h1': self.h1 += 1
        if tag == 'title': self.in_title = True
        if tag == 'script' and a.get('type') == 'application/ld+json': self.in_schema = True
    def handle_data(self, data):
        if self.in_title: self.title += data
        if self.in_schema: self.schema_text += data
    def handle_endtag(self, tag):
        if tag == 'title': self.in_title = False
        if tag == 'script' and self.in_schema:
            self.schema.append(json.loads(self.schema_text))
            self.schema_text, self.in_schema = '', False

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args): return None

opener = urllib.request.build_opener(NoRedirect)
def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'FGC-SEO-Audit/1.0'})
    try: response = opener.open(req, timeout=30)
    except urllib.error.HTTPError as e: response = e
    body = response.read().decode('utf-8', errors='replace')
    p = Page()
    if 'text/html' in response.headers.get('Content-Type', ''): p.feed(body)
    return {'url': url, 'status': response.status, 'location': response.headers.get('Location'),
            'robots_header': response.headers.get('X-Robots-Tag'), 'canonical': p.canonical,
            'robots': p.robots, 'title': p.title, 'description': p.description, 'h1': p.h1,
            'structured_data': p.schema}, body

sitemap, xml = fetch(BASE + '/sitemap.xml')
urls = [el.text for el in ET.fromstring(xml).iter() if el.tag.endswith('loc')]
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
    pages = [result[0] for result in pool.map(fetch, urls)]
variants = [BASE+'/blog?page=1', BASE+'/blog?utm_source=audit', BASE+'/blog?q=Formula',
            BASE+'/missing-audit-page', 'http://fastgirlsclub.co.uk/blog',
            'https://www.fastgirlsclub.co.uk/blog', 'https://fast-girls-club.onrender.com/blog',
            BASE+'/category/formula-1', BASE+'/author/fast-girls-club',
            'https://cms.fastgirlsclub.co.uk/', 'https://cms.fastgirlsclub.co.uk/feed/',
            'https://cms.fastgirlsclub.co.uk/sitemap_index.xml']
variants = [fetch(url)[0] for url in variants]
req = urllib.request.urlopen('https://cms.fastgirlsclub.co.uk/wp-json/wp/v2/posts?per_page=100&fgc_refresh='+str(int(time.time()/15)), timeout=30)
posts = json.load(req)
wp = [fetch(post['link'])[0] for post in posts]
failures = []
for p in pages:
    if p['status'] != 200: failures.append(p['url']+' is not 200')
    if p['canonical'] != [p['url']]: failures.append(p['url']+' missing/mismatched canonical')
    if p['h1'] != 1: failures.append(p['url']+' should have one H1')
    if not p['description']: failures.append(p['url']+' missing description')
    if any('noindex' in r for r in p['robots']): failures.append(p['url']+' unexpectedly noindex')
    if '/blog/' in p['url'] and not p['structured_data']: failures.append(p['url']+' missing article schema')
for p in wp:
    if p['status'] not in (301,302,308) or not (p['location'] or '').startswith(BASE+'/blog/'):
        failures.append(p['url']+' does not redirect to frontend article')
for p in variants:
    if p['url'].endswith('/feed/') and p['status'] == 200 and 'noindex' not in (p['robots_header'] or ''):
        failures.append('CMS full-text RSS is indexable; install plugin 0.2.1 and purge CMS caches')
    if 'onrender.com/blog' in p['url'] and p['location'] != BASE+'/blog':
        failures.append('Render hostname must redirect to the publication')
    if p['url'].endswith('/category/formula-1') and p['status'] != 308:
        failures.append('Legacy Formula 1 archive must redirect to the matching blog filter')
    if p['url'].endswith('/author/fast-girls-club') and p['status'] != 308:
        failures.append('Legacy publisher archive must redirect to the blog')
    if '?q=Formula' in p['url'] and not any('noindex' in r for r in p['robots']):
        failures.append('Internal search pages must be noindex')
result = {'sitemap_count' : len(urls), 'pages': pages, 'variants': variants, 'wordpress_posts': wp, 'failures': failures}
if len(sys.argv)>1:
    with open(sys.argv[1], 'w') as f: json.dump(result, f, indent=2)
print(json.dumps({'sitemap_pages':len(pages),'wordpress_posts':len(wp),'failures':failures},indent=2))
sys.exit(bool(failures))
