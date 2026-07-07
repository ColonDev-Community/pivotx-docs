import { useEffect } from 'react';

const SITE = 'pIvotX';
const BASE_URL = 'https://pivotx.colondev.com';

function setMeta(selector: string, attr: string, value: string) {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = document.createElement(selector.startsWith('link') ? 'link' : 'meta');
    const [, key, val] = selector.match(/\[(.+?)="(.+?)"\]/) ?? [];
    if (key && val) el.setAttribute(key, val);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

/**
 * Per-route SEO: sets document.title, meta description, canonical URL, and
 * the matching Open Graph/Twitter tags. SPA-friendly — updates on navigation.
 *
 * @param title        Page title (site name is appended automatically).
 * @param description  Meta description for this page.
 * @param path         Route path for the canonical URL (e.g. '/docs/2.0.0').
 */
export function usePageMeta(title: string, description?: string, path?: string) {
  useEffect(() => {
    const fullTitle = title.includes(SITE) ? title : `${title} · ${SITE}`;
    document.title = fullTitle;
    setMeta('meta[property="og:title"]', 'content', fullTitle);
    setMeta('meta[name="twitter:title"]', 'content', fullTitle);

    if (description) {
      setMeta('meta[name="description"]', 'content', description);
      setMeta('meta[property="og:description"]', 'content', description);
      setMeta('meta[name="twitter:description"]', 'content', description);
    }

    const url = `${BASE_URL}${path ?? window.location.pathname}`;
    setMeta('link[rel="canonical"]', 'href', url);
    setMeta('meta[property="og:url"]', 'content', url);
  }, [title, description, path]);
}
