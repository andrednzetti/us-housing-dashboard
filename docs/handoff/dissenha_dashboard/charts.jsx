// Shared chart primitives — sparklines, area charts, bars
// Returns React elements (SVG)

function Sparkline({ data, w = 80, h = 24, color = 'currentColor', strokeWidth = 1.25, fill = false, fillOpacity = 0.12 }) {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = w / (data.length - 1);
  const points = data.map((v, i) => [i * stepX, h - ((v - min) / range) * h]);
  const path = points.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ');
  const areaPath = fill
    ? `${path} L ${w} ${h} L 0 ${h} Z`
    : null;
  return (
    <svg width={w} height={h} style={{ display: 'block', overflow: 'visible' }}>
      {fill && <path d={areaPath} fill={color} fillOpacity={fillOpacity} />}
      <path d={path} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function AreaChart({ data, w = 600, h = 180, color = '#c4664a', gridColor = 'rgba(0,0,0,0.06)', axisColor = 'rgba(0,0,0,0.4)', label = '', formatY = (v) => v.toFixed(2), padX = 12, padTop = 12, padBottom = 24 }) {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const innerW = w - padX * 2;
  const innerH = h - padTop - padBottom;
  const stepX = innerW / (data.length - 1);
  const points = data.map((v, i) => [padX + i * stepX, padTop + innerH - ((v - min) / range) * innerH]);
  const linePath = points.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ');
  const areaPath = `${linePath} L ${padX + innerW} ${padTop + innerH} L ${padX} ${padTop + innerH} Z`;

  // Y ticks
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => min + range * t);
  return (
    <svg width={w} height={h} style={{ display: 'block', overflow: 'visible' }}>
      {/* Grid */}
      {ticks.map((t, i) => {
        const y = padTop + innerH - ((t - min) / range) * innerH;
        return (
          <g key={i}>
            <line x1={padX} y1={y} x2={padX + innerW} y2={y} stroke={gridColor} strokeWidth="0.5" strokeDasharray={i === 0 || i === 4 ? '0' : '2 3'} />
            <text x={padX + innerW + 6} y={y + 3} fontSize="9" fill={axisColor} fontFamily="JetBrains Mono, monospace">{formatY(t)}</text>
          </g>
        );
      })}
      <defs>
        <linearGradient id={`grad-${label.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#grad-${label.replace(/\s/g, '')})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      {/* Last point dot */}
      <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r="2.5" fill={color} />
    </svg>
  );
}

function HBarSimple({ value, max, color = 'currentColor', height = 4, bg = 'rgba(0,0,0,0.08)' }) {
  const w = Math.max(0, Math.min(1, value / max)) * 100;
  return (
    <div style={{ width: '100%', height, background: bg, borderRadius: height / 2, overflow: 'hidden' }}>
      <div style={{ width: `${w}%`, height: '100%', background: color }} />
    </div>
  );
}

// Diverging gauge (e.g. -10 to +10)
function Gauge({ value, min = -1, max = 1, w = 160, h = 8, color = '#c4664a', neg = '#a85050', bg = 'rgba(0,0,0,0.08)' }) {
  const mid = w / 2;
  const range = max - min;
  const zeroPos = mid; // center
  const t = (value - min) / range; // 0..1
  const xv = t * w;
  const isNeg = value < 0;
  const start = isNeg ? xv : zeroPos;
  const end = isNeg ? zeroPos : xv;
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <rect x="0" y="0" width={w} height={h} rx={h / 2} fill={bg} />
      <rect x={start} y="0" width={Math.max(1, end - start)} height={h} fill={isNeg ? neg : color} />
      <line x1={mid} y1="-2" x2={mid} y2={h + 2} stroke="rgba(0,0,0,0.4)" strokeWidth="1" />
    </svg>
  );
}

// Donut for distribution
function Donut({ segments, size = 80, thickness = 12, gap = 0.02 }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  let acc = 0;
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ display: 'block', transform: 'rotate(-90deg)' }}>
      {segments.map((s, i) => {
        const frac = s.value / total;
        const len = c * frac - c * gap;
        const off = c * acc;
        acc += frac;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={thickness}
            strokeDasharray={`${Math.max(0, len)} ${c}`}
            strokeDashoffset={-off}
          />
        );
      })}
    </svg>
  );
}

Object.assign(window, { Sparkline, AreaChart, HBarSimple, Gauge, Donut });
