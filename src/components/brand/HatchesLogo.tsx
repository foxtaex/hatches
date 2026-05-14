/**
 * Hatches Logo System
 *
 * Treatment A (Vivid) — mint squircle · white H · perspective crossbar
 * Treatment B (Subtle) — dark squircle · glowing mint H
 * Treatment C (Outline) — neon-edge stroke
 *
 * Usage:
 *   <HatchesLogo />                        — Mark A, 28px, no wordmark
 *   <HatchesLogo size={64} />              — Mark A, 64px, no wordmark
 *   <HatchesLogo wordmark />               — Mark A + wordmark "hatches"
 *   <HatchesLogo size={64} wordmark />      — Large lockup
 *   <HatchesLogo variant="B" />            — Treatment B
 *   <HatchesLogo variant="C" />            — Treatment C
 */

interface Props {
  /** Size in px for the mark (default: 28) */
  size?: number;
  /** Show "hatches" wordmark beside the mark */
  wordmark?: boolean;
  /** Font size for wordmark (default: size * 0.64) */
  wordmarkSize?: number;
  /** Variant: "A" (vivid/mint), "B" (subtle/dark), "C" (outline/neon) */
  variant?: "A" | "B" | "C";
  className?: string;
}

// Unique ID counter so multiple instances don't clash
let _uid = 0;

// ──────────────────────────────────────────────────────────────────────────
// MARK A — Vivid: mint squircle, white H, perspective crossbar lid
// ──────────────────────────────────────────────────────────────────────────
function MarkA({ size = 280, uid = "" }: { size?: number; uid?: string }) {
  const gm = `ma-${uid}-m`;
  const gl = `ma-${uid}-l`;
  return (
    <svg width={size} height={size} viewBox="0 0 280 280" aria-hidden="true">
      <defs>
        <linearGradient id={gm} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3CC79A" />
          <stop offset="100%" stopColor="#138A6E" />
        </linearGradient>
        <linearGradient id={gl} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#aef0d2" />
          <stop offset="100%" stopColor="#3CC79A" />
        </linearGradient>
      </defs>
      {/* Squircle background */}
      <path
        d="M 64 20 Q 20 20 20 64 L 20 216 Q 20 260 64 260 L 216 260 Q 260 260 260 216 L 260 64 Q 260 20 216 20 Z"
        fill={`url(#${gm})`}
      />
      {/* H pillars */}
      <g fill="#ffffff">
        <rect x="74" y="66" width="32" height="148" rx="5" />
        <rect x="174" y="66" width="32" height="148" rx="5" />
      </g>
      {/* Crossbar shadow */}
      <polygon points="74,158 206,142 206,150 74,168" fill="#0a3b2e" opacity="0.18" />
      {/* Crossbar (perspective hatch lid) */}
      <polygon points="74,128 206,112 206,140 74,156" fill={`url(#${gl})`} />
      {/* Top highlight */}
      <polygon points="74,128 206,112 206,116 74,132" fill="#ffffff" opacity="0.35" />
    </svg>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// MARK B — Subtle: dark squircle, glowing mint H
// ──────────────────────────────────────────────────────────────────────────
function MarkB({ size = 280, uid = "" }: { size?: number; uid?: string }) {
  const gm = `mb-${uid}-m`;
  const gl = `mb-${uid}-l`;
  const gf = `mb-${uid}-f`;
  const blur = Math.max(3, size / 50);
  return (
    <svg width={size} height={size} viewBox="0 0 280 280" aria-hidden="true">
      <defs>
        <linearGradient id={gm} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a3f33" />
          <stop offset="100%" stopColor="#0e2620" />
        </linearGradient>
        <linearGradient id={gl} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7CE3B3" />
          <stop offset="100%" stopColor="#3CC79A" />
        </linearGradient>
        <filter id={gf} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={blur} />
        </filter>
      </defs>
      {/* Squircle background */}
      <path
        d="M 64 20 Q 20 20 20 64 L 20 216 Q 20 260 64 260 L 216 260 Q 260 260 260 216 L 260 64 Q 260 20 216 20 Z"
        fill={`url(#${gm})`}
        stroke="#23574a"
        strokeWidth="1"
      />
      {/* Glowing H */}
      <g filter={`url(#${gf})`} opacity="0.85">
        <rect x="74" y="66" width="32" height="148" rx="5" fill="#3CC79A" />
        <rect x="174" y="66" width="32" height="148" rx="5" fill="#3CC79A" />
        <polygon points="74,128 206,112 206,140 74,156" fill="#3CC79A" />
      </g>
      {/* H pillars */}
      <g fill="#7CE3B3">
        <rect x="74" y="66" width="32" height="148" rx="5" />
        <rect x="174" y="66" width="32" height="148" rx="5" />
      </g>
      {/* Crossbar shadow */}
      <polygon points="74,158 206,142 206,150 74,168" fill="#000" opacity="0.35" />
      {/* Crossbar */}
      <polygon points="74,128 206,112 206,140 74,156" fill={`url(#${gl})`} />
      {/* Top highlight */}
      <polygon points="74,128 206,112 206,116 74,132" fill="#ffffff" opacity="0.25" />
    </svg>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// MARK C — Outline: neon-edge silhouette
// ──────────────────────────────────────────────────────────────────────────
function MarkC({ size = 280, uid = "" }: { size?: number; uid?: string }) {
  const gl = `mc-${uid}-l`;
  const gf = `mc-${uid}-f`;
  const sw = Math.max(2, Math.round(size / 80) + 1);
  const blur = Math.max(2, size / 80);
  return (
    <svg width={size} height={size} viewBox="0 0 280 280" aria-hidden="true">
      <defs>
        <linearGradient id={gl} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7CE3B3" />
          <stop offset="100%" stopColor="#3CC79A" />
        </linearGradient>
        <filter id={gf} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={blur} />
        </filter>
      </defs>
      {/* Glow stroke */}
      <g filter={`url(#${gf})`} opacity="0.55">
        <path
          d="M 64 20 Q 20 20 20 64 L 20 216 Q 20 260 64 260 L 216 260 Q 260 260 260 216 L 260 64 Q 260 20 216 20 Z"
          fill="none"
          stroke="#3CC79A"
          strokeWidth={sw + 2}
        />
      </g>
      {/* Main stroke */}
      <path
        d="M 64 20 Q 20 20 20 64 L 20 216 Q 20 260 64 260 L 216 260 Q 260 260 260 216 L 260 64 Q 260 20 216 20 Z"
        fill="none"
        stroke="#3CC79A"
        strokeWidth={sw}
      />
      {/* H pillars */}
      <g fill="none" stroke="#3CC79A" strokeWidth={sw} strokeLinejoin="round">
        <rect x="74" y="66" width="32" height="148" rx="5" />
        <rect x="174" y="66" width="32" height="148" rx="5" />
      </g>
      {/* Crossbar */}
      <polygon points="74,128 206,112 206,140 74,156" fill={`url(#${gl})`} />
      {/* Top highlight */}
      <polygon points="74,128 206,112 206,116 74,132" fill="#ffffff" opacity="0.3" />
    </svg>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Wordmark — "hatches" + glowing mint dot
// ──────────────────────────────────────────────────────────────────────────
function WordmarkText({
  size = 64,
  dotSize = null,
}: {
  size?: number;
  dotSize?: number | null;
}) {
  const ds = dotSize ?? Math.round(size * 0.16);
  return (
    <div style={{ display: "flex", alignItems: "baseline" }}>
      <span
        style={{
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
          fontWeight: 600,
          fontSize: size,
          letterSpacing: "-0.045em",
          color: "#f5f5f7",
          lineHeight: 1,
        }}
      >
        hatches
      </span>
      <span
        style={{
          width: ds,
          height: ds,
          borderRadius: "50%",
          background: "linear-gradient(135deg,#7CE3B3,#1e8e74)",
          marginLeft: Math.round(size * 0.08),
          marginBottom: Math.round(size * 0.1),
          alignSelf: "flex-end",
          boxShadow: "0 0 28px rgba(60,199,154,0.6)",
          display: "inline-block",
          flexShrink: 0,
        }}
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// HatchesLogo — main export
// ──────────────────────────────────────────────────────────────────────────
export function HatchesLogo({
  size = 28,
  wordmark = false,
  wordmarkSize,
  variant = "A",
  className = "",
}: Props) {
  const uid = `hl-${++_uid}`;
  const wSize = wordmarkSize ?? Math.round(size * 0.64);
  const dotSize = Math.round(wSize * 0.13);
  const gap = Math.round(size * 0.45);

  const Mark = variant === "B" ? MarkB : variant === "C" ? MarkC : MarkA;

  return (
    <div
      className={`flex items-center select-none ${className}`}
      style={{ gap }}
    >
      {/* ── Mark ── */}
      <Mark size={size} uid={uid} />

      {/* ── Wordmark ── */}
      {wordmark && <WordmarkText size={wSize} dotSize={dotSize} />}
    </div>
  );
}