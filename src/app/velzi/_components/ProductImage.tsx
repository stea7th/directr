"use client";

import { useState } from "react";
import { IconBrush } from "./Icons";

/**
 * Product shot with a branded fallback. Shopify CDN images can fail behind
 * corporate proxies or ad blockers, and a broken-image glyph in the hero is
 * worse than no image at all.
 */
export default function ProductImage({
  src,
  alt,
  className,
  style,
}: {
  src: string | null;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={className}
        style={{
          display: "grid",
          placeItems: "center",
          gap: 10,
          color: "var(--v-accent)",
          background:
            "radial-gradient(circle at 50% 40%, rgba(46,230,214,.14), transparent 65%)",
          ...style,
        }}
        role="img"
        aria-label={alt}
      >
        <IconBrush size={46} />
        <span style={{ fontSize: 12, letterSpacing: "0.16em", color: "var(--v-muted)" }}>
          VELZI 360
        </span>
      </div>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}
