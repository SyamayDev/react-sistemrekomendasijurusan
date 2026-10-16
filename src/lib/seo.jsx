/**
 * Per-page SEO. Pages call useSeo({...}); during prerendering the values are
 * captured through SeoContext and written into static <head> tags, and on the
 * client the same values update document.head on every navigation.
 */
import { createContext, useContext, useEffect } from "react";
import { SITE, absoluteUrl } from "./site.js";

export const SeoContext = createContext(null);

const OG_IMAGE = () => `${SITE.url}/og-image.jpg`;

export function fullTitle(title) {
  return !title ? `${SITE.name} — ${SITE.tagline}` : title.includes(SITE.name) ? title : `${title} · ${SITE.name}`;
}

/**
 * @param {{ title?: string, description: string, path: string,
 *   noindex?: boolean, type?: string, jsonLd?: object[] }} seo
 */
export function useSeo(seo) {
  const collector = useContext(SeoContext);
  collector?.collect(seo); // prerender pass: record for static <head>, don't touch the DOM
  const key = JSON.stringify(seo);
  useEffect(() => applySeo(JSON.parse(key)), [key]);
}

function upsert(selector, create) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  return el;
}

function setMeta(attr, key, content) {
  upsert(`meta[${attr}="${key}"]`, () => {
    const m = document.createElement("meta");
    m.setAttribute(attr, key);
    return m;
  }).setAttribute("content", content);
}

function applySeo(seo) {
  const title = fullTitle(seo.title);
  const url = absoluteUrl(seo.path);
  document.title = title;
  setMeta("name", "description", seo.description);
  setMeta("name", "robots", seo.noindex ? "noindex, follow" : "index, follow, max-image-preview:large");
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", seo.description);
  setMeta("property", "og:url", url);
  setMeta("property", "og:type", seo.type || "website");
  setMeta("name", "twitter:title", title);
  setMeta("name", "twitter:description", seo.description);
  upsert('link[rel="canonical"]', () => {
    const l = document.createElement("link");
    l.rel = "canonical";
    return l;
  }).href = url;
  const ld = document.getElementById("seo-jsonld");
  if (seo.jsonLd?.length) {
    const s = ld || Object.assign(document.createElement("script"), { id: "seo-jsonld", type: "application/ld+json" });
    s.textContent = JSON.stringify(seo.jsonLd.length === 1 ? seo.jsonLd[0] : seo.jsonLd);
    if (!ld) document.head.appendChild(s);
  } else {
    ld?.remove();
  }
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Static <head> markup for the prerenderer. */
export function headTags(seo) {
  const title = fullTitle(seo.title);
  const url = absoluteUrl(seo.path);
  const tags = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(seo.description)}">`,
    `<meta name="robots" content="${seo.noindex ? "noindex, follow" : "index, follow, max-image-preview:large"}">`,
    `<link rel="canonical" href="${esc(url)}">`,
    `<meta property="og:site_name" content="${SITE.name}">`,
    `<meta property="og:locale" content="${SITE.locale}">`,
    `<meta property="og:type" content="${esc(seo.type || "website")}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(seo.description)}">`,
    `<meta property="og:url" content="${esc(url)}">`,
    `<meta property="og:image" content="${OG_IMAGE()}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="SI-RAJU — tes minat bakat dan rekomendasi jurusan kuliah">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(seo.description)}">`,
    `<meta name="twitter:image" content="${OG_IMAGE()}">`,
  ];
  if (seo.jsonLd?.length) {
    const json = JSON.stringify(seo.jsonLd.length === 1 ? seo.jsonLd[0] : seo.jsonLd).replace(/</g, "\\u003c");
    tags.push(`<script id="seo-jsonld" type="application/ld+json">${json}</script>`);
  }
  return tags.join("\n    ");
}

/* ---------- JSON-LD helpers ---------- */
export const ldOrganization = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.name,
  url: `${SITE.url}/`,
  logo: `${SITE.url}/icon-512.png`,
  sameAs: [SITE.github],
});

export const ldWebSite = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  alternateName: "Sistem Rekomendasi Jurusan",
  url: `${SITE.url}/`,
  inLanguage: "id-ID",
});

export const ldBreadcrumbs = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.name,
    item: absoluteUrl(it.path),
  })),
});
