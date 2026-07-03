import { useEffect } from "react";

const BASE_TITLE = "Salon Dương Chi";
const BASE_URL = "https://salonduongchi.website";

interface SEOOptions {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogUrl?: string;
  ogImage?: string;
  noIndex?: boolean;
}

/**
 * useSEO — Dynamic SEO hook (vanilla DOM, no extra deps)
 *
 * Ưu tiên react-helmet nếu dự án bổ sung sau này.
 * Hiện tại dùng DOM manipulation trong useEffect để:
 * - Set document.title
 * - Upsert <meta name="description">
 * - Upsert <link rel="canonical">
 * - Upsert Open Graph meta tags
 * - Cleanup khi unmount (reset về giá trị index.html)
 */
const useSEO = ({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogUrl,
  ogImage,
  noIndex = false,
}: SEOOptions = {}) => {
  useEffect(() => {
    const fullTitle = title
      ? `${title} | ${BASE_TITLE}`
      : `${BASE_TITLE} — Cắt, Uốn, Nhuộm & Chăm Sóc Tóc Chuyên Nghiệp tại Lộc Ninh`;

    // ── Title ──────────────────────────────────────────────
    const prevTitle = document.title;
    document.title = fullTitle;

    // ── Helper: upsert meta tag ────────────────────────────
    const upsertMeta = (
      selector: string,
      attr: string,
      value: string
    ): (() => void) => {
      let el = document.querySelector<HTMLMetaElement>(selector);
      let created = false;
      const prevContent = el?.getAttribute("content") ?? null;

      if (!el) {
        el = document.createElement("meta");
        const [attrName, attrValue] = attr.split("=");
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
        created = true;
      }
      el.setAttribute("content", value);

      return () => {
        if (created) {
          el?.remove();
        } else if (prevContent !== null && el) {
          el.setAttribute("content", prevContent);
        }
      };
    };

    // ── Helper: upsert link tag ────────────────────────────
    const upsertLink = (
      rel: string,
      href: string
    ): (() => void) => {
      let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      let created = false;
      const prevHref = el?.getAttribute("href") ?? null;

      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
        created = true;
      }
      el.setAttribute("href", href);

      return () => {
        if (created) {
          el?.remove();
        } else if (prevHref !== null && el) {
          el.setAttribute("href", prevHref);
        }
      };
    };

    const cleanups: Array<() => void> = [];

    // ── Description ────────────────────────────────────────
    if (description) {
      cleanups.push(
        upsertMeta('meta[name="description"]', "name=description", description)
      );
    }

    // ── Robots ─────────────────────────────────────────────
    if (noIndex) {
      cleanups.push(
        upsertMeta('meta[name="robots"]', "name=robots", "noindex, nofollow")
      );
    }

    // ── Canonical ──────────────────────────────────────────
    if (canonical) {
      const fullCanonical = canonical.startsWith("http")
        ? canonical
        : `${BASE_URL}${canonical}`;
      cleanups.push(upsertLink("canonical", fullCanonical));
    }

    // ── Open Graph ─────────────────────────────────────────
    const resolvedOgTitle = ogTitle ?? fullTitle;
    const resolvedOgDesc = ogDescription ?? description ?? "";
    const resolvedOgUrl = ogUrl
      ? ogUrl.startsWith("http")
        ? ogUrl
        : `${BASE_URL}${ogUrl}`
      : canonical
        ? canonical.startsWith("http")
          ? canonical
          : `${BASE_URL}${canonical}`
        : BASE_URL;

    if (resolvedOgTitle) {
      cleanups.push(
        upsertMeta('meta[property="og:title"]', "property=og:title", resolvedOgTitle)
      );
    }
    if (resolvedOgDesc) {
      cleanups.push(
        upsertMeta('meta[property="og:description"]', "property=og:description", resolvedOgDesc)
      );
    }
    cleanups.push(
      upsertMeta('meta[property="og:url"]', "property=og:url", resolvedOgUrl)
    );
    if (ogImage) {
      cleanups.push(
        upsertMeta('meta[property="og:image"]', "property=og:image", ogImage)
      );
    }

    // ── Cleanup on unmount ─────────────────────────────────
    return () => {
      document.title = prevTitle;
      cleanups.forEach((fn) => fn());
    };
  }, [title, description, canonical, ogTitle, ogDescription, ogUrl, ogImage, noIndex]);
};

export default useSEO;
