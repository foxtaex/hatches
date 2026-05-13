/**
 * Hatches Logo System — Treatment A (Vivid)
 * Mint squircle · white H · perspective crossbar
 *
 * Usage:
 *   <HatchesLogo size={28} />                    — icon only
 *   <HatchesLogo size={28} wordmark />            — compact lockup (nav)
 *   <HatchesLogo size={64} wordmark wordmarkSize={42} /> — hero lockup
 */

import { useId } from "react";

interface Props {
  size?: number;
  /** Show "hatches" wordmark beside the mark */
  wordmark?: boolean;
  /** Font size for wordmark (defaults to size * 0.64) */
  wordmarkSize?: number;
  className?: string;
}

export function HatchesLogo({ size = 28, wordmark = false, wordmarkSize, className = "" }: Props) {
  const uid = useId();
  const gm = `${uid}-m`;
  const gl = `${uid}-l`;
  const wSize = wordmarkSize ?? Math.round(size * 0.64);
  const dotSize = Math.round(wSize * 0.13);
  const gap = Math.round(size * 0.45);

  return (
    <div className={`flex items-center select-none ${className}`} style={{ gap }}>
      {/* ── Mark ── */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 280 280"
        style={{ flexShrink: 0 }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gm} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#3CC79A" />
            <stop offset="100%" stopColor="#138A6E" />
          </linearGradient>
          <linearGradient id={gl} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#aef0d2" />
            <stop offset="100%" stopColor="#3CC79A" />
          </linearGradient>
        </defs>
        {/* Squircle background */}
        <path
          d="M 64 20 Q 20 20 20 64 L 20 216 Q 20 260 64 260 L 216 260 Q 260 260 260 216 L 260 64 Q 260 20 216 20 Z"
          fill={`url(#${gm})`}
        />
        {/* H pillars */}
        <rect x="74"  y="66" width="32" height="148" rx="5" fill="#fff" />
        <rect x="174" y="66" width="32" height="148" rx="5" fill="#fff" />
        {/* Crossbar shadow */}
        <polygon points="74,158 206,142 206,150 74,168" fill="#0a3b2e" opacity="0.18" />
        {/* Crossbar (perspective hatch lid) */}
        <polygon points="74,128 206,112 206,140 74,156" fill={`url(#${gl})`} />
        {/* Top highlight */}
        <polygon points="74,128 206,112 206,116 74,132" fill="#ffffff" opacity="0.35" />
      </svg>

      {/* ── Wordmark ── */}
      {wordmark && (
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span
            style={{
              fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
              fontWeight: 700,
              fontSize: wSize,
              letterSpacing: "-0.8px",
              background: "linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1,
            }}
          >
            hatches
          </span>
          <span
            style={{
              width: dotSize,
              height: dotSize,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#7CE3B3,#1e8e74)",
              marginLeft: Math.round(wSize * 0.05),
              marginBottom: Math.round(wSize * 0.08),
              alignSelf: "flex-end",
              boxShadow: `0 0 ${Math.round(dotSize * 2.5)}px rgba(60,199,154,0.7)`,
              display: "inline-block",
              flexShrink: 0,
            }}
          />
        </div>
      )}
    </div>
  );
}
