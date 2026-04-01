import { useEffect } from 'react';

interface DocumentMeta {
  title: string;
  description: string;
  canonicalPath?: string;
  ogType?: string;
  ogImage?: string;
  noindex?: boolean;
}

const SITE_NAME = 'Nourished Rebel';
const BASE_URL = 'https://nourishedrebel.com';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

export function useDocumentMeta({
  title,
  description,
  canonicalPath = '',
  ogType = 'website',
  ogImage,
  noindex = false,
}: DocumentMeta) {
  useEffect(() => {
    const fullTitle = title === SITE_NAME
      ? `${SITE_NAME} | Holistic Nutrition & Wellness Coaching`
      : `${title} | ${SITE_NAME}`;

    document.title = fullTitle;

    setMetaTag('name', 'description', description);
    setMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:url', `${BASE_URL}${canonicalPath}`);
    setMetaTag('property', 'og:image', ogImage || DEFAULT_OG_IMAGE);

    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage || DEFAULT_OG_IMAGE);

    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = `${BASE_URL}${canonicalPath}`;

    return () => {
      document.title = `${SITE_NAME} | Holistic Nutrition & Wellness Coaching`;
    };
  }, [title, description, canonicalPath, ogType, ogImage, noindex]);
}

function setMetaTag(attr: 'name' | 'property', key: string, value: string) {
  let tag = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.content = value;
}
