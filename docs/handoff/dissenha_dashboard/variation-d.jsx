// Variation D — Documento Corporativo / Invoice-inspired
// Palette derived from Dissenha Moulding invoice: warm off-white paper,
// deep charcoal ink, subtle gold accent — formal, restrained, document-like.

// Palette extracted from Dissenha Moulding brand:
// deep forest green (#0d3d2e) + burnt orange (#c5673f) on warm light gray.
const D_TONE = {
  bg: '#d8d6d1',           // warm light gray (brand site bg)
  bgPanel: '#e8e6e0',       // slightly lighter gray card
  bgPanelAlt: '#cfcdc7',    // slightly darker gray
  bgBand: '#0d3d2e',        // deep brand forest green (header band)
  bgBandSoft: '#164a3a',
  ink: '#1a2a22',           // dark green-ink
  inkSoft: '#4a5a52',
  inkMute: '#8a8a83',
  rule: '#b8b6b0',          // gray divider
  ruleSoft: '#c8c6c0',
  pos: '#0d3d2e',           // brand green for positive
  neg: '#a8432b',           // muted brick
  accent: '#c5673f',        // brand burnt orange
  accentSoft: '#e8c4a8',
  accentDark: '#a04f2a',
  inkInverse: '#e8e6e0',
};

function DSeal({ size = 36 }) {
  // Dissenha Moulding logo — stylized wood shavings monogram
  // Three angular shapes: left wedge, central vertical+chevron, right wedge
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" style={{ display: 'block' }}>
      {/* Left wood-shaving wedge */}
      <path d="M 8 38 L 30 34 L 26 50 L 4 54 Z" fill={D_TONE.accent} />
      <path d="M 4 54 L 26 50 L 22 60 L 8 62 Z" fill={D_TONE.accent} opacity="0.75" />
      {/* Right wood-shaving wedge (mirrored) */}
      <path d="M 92 38 L 70 34 L 74 50 L 96 54 Z" fill={D_TONE.accent} />
      <path d="M 96 54 L 74 50 L 78 60 L 92 62 Z" fill={D_TONE.accent} opacity="0.75" />
      {/* Center: vertical bar */}
      <rect x="46" y="18" width="8" height="46" fill={D_TONE.accent} />
      {/* Center: chevron base */}
      <path d="M 34 64 L 50 50 L 66 64 L 60 70 L 50 60 L 40 70 Z" fill={D_TONE.accent} />
    </svg>
  );
}

function DLogo({ height = 42, color = D_TONE.accent }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, gap: 3 }}>
      <span style={{
        fontFamily: '"Inter", -apple-system, sans-serif',
        fontSize: height * 0.42,
        fontWeight: 700,
        letterSpacing: '0.08em',
        color,
        textTransform: 'uppercase',
      }}>Dissenha</span>
      <span style={{
        fontFamily: '"Inter", -apple-system, sans-serif',
        fontSize: height * 0.42,
        fontWeight: 700,
        letterSpacing: '0.08em',
        color,
        textTransform: 'uppercase',
      }}>Moulding</span>
    </div>
  );
}

function DStamp({ children, color = D_TONE.accent }) {
  return (
    <span style={{
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 9,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color,
      border: `0.75px solid ${color}`,
      padding: '3px 8px',
      borderRadius: 1,
      background: 'transparent',
    }}>{children}</span>
  );
}

function DDelta({ value, unit = '%', period = '' }) {
  const pos = value > 0;
  const zero = value === 0;
  const color = zero ? D_TONE.inkMute : pos ? D_TONE.pos : D_TONE.neg;
  return (
    <span style={{ color, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 500 }}>
      {pos ? '+' : zero ? '±' : ''}{value.toFixed(unit === 'pp' ? 2 : 1)}{unit}
      {period && <span style={{ color: D_TONE.inkMute, marginLeft: 6, fontWeight: 400 }}>· {period}</span>}
    </span>
  );
}

function DEntry({ ind, dense, selected, onClick }) {
  const group = window.housingData.groups[ind.group];
  return (
    <div
      onClick={onClick}
      style={{
        display: 'grid',
        gridTemplateColumns: dense ? '14px 90px 1fr 100px 110px 80px' : '16px 110px 1fr 110px 130px 100px',
        gap: 14,
        alignItems: 'center',
        padding: dense ? '8px 18px' : '12px 22px',
        background: selected ? D_TONE.ruleSoft : 'transparent',
        cursor: 'pointer',
        borderBottom: `0.5px solid ${D_TONE.rule}`,
        transition: 'background 0.12s',
      }}
      onMouseEnter={(e) => !selected && (e.currentTarget.style.background = '#fbf8f0')}
      onMouseLeave={(e) => !selected && (e.currentTarget.style.background = 'transparent')}
    >
      <span style={{ width: 6, height: 6, background: group.accent, borderRadius: '50%' }} />
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: D_TONE.inkMute, letterSpacing: '0.12em' }}>{ind.short}</span>
      <span style={{ fontFamily: '"Source Serif 4", Georgia, serif', fontSize: 14, color: D_TONE.ink }}>{ind.name}</span>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: D_TONE.ink, textAlign: 'right', fontWeight: 500 }}>{ind.fmt(ind.value)}</span>
      <div style={{ textAlign: 'right' }}><DDelta value={ind.delta} unit={ind.deltaUnit} period={ind.deltaPeriod} /></div>
      <window.Sparkline data={ind.series} w={'100%'} h={dense ? 14 : 18} color={ind.delta >= 0 ? D_TONE.pos : D_TONE.neg} strokeWidth={1.1} />
    </div>
  );
}

function DVariation({ dense = false }) {
  const { indicators, groups, regions, metros, events } = window.housingData;
  const [selected, setSelected] = React.useState(indicators[0]);
  const [activeGroup, setActiveGroup] = React.useState('all');

  const filtered = activeGroup === 'all' ? indicators : indicators.filter((i) => i.group === activeGroup);

  return (
    <div style={{
      width: '100%',
      minHeight: '100%',
      background: D_TONE.bg,
      color: D_TONE.ink,
      fontFamily: '"Inter", -apple-system, sans-serif',
      boxSizing: 'border-box',
      backgroundImage: `radial-gradient(circle at 1px 1px, ${D_TONE.rule} 0.5px, transparent 0)`,
      backgroundSize: '24px 24px',
      backgroundPosition: '0 0',
    }}>
      {/* DOCUMENT HEADER — invoice-style */}
      <header style={{
        background: D_TONE.bgBand,
        color: D_TONE.inkInverse,
        padding: '32px 48px 28px',
        position: 'relative',
      }}>
        {/* gold accent line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${D_TONE.accent} 0%, ${D_TONE.accent} 35%, transparent 100%)` }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'flex-start', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <DLogo height={48} color={D_TONE.accent} />
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.18em', color: 'rgba(247,244,236,0.55)', textTransform: 'uppercase' }}>Boletim · Nº 18 / Vol. 06</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: D_TONE.accent, marginTop: 4, letterSpacing: '0.08em' }}>05 · MAI · 2026</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, paddingTop: 24, borderTop: `0.5px solid rgba(184,137,58,0.35)` }}>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.22em', color: D_TONE.accent, textTransform: 'uppercase', marginBottom: 10 }}>Boletim Semanal</div>
            <h1 style={{
              fontFamily: '"Source Serif 4", Georgia, serif',
              fontSize: 46,
              fontWeight: 400,
              letterSpacing: '-0.025em',
              lineHeight: 1.05,
              margin: 0,
            }}>
              Mercado Imobiliário<br />
              <em style={{ fontStyle: 'italic', color: D_TONE.accent, fontWeight: 400 }}>dos Estados Unidos</em>
            </h1>
          </div>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.22em', color: D_TONE.accent, textTransform: 'uppercase', marginBottom: 10 }}>Destinatário</div>
            <p style={{ fontFamily: '"Source Serif 4", Georgia, serif', fontSize: 14, lineHeight: 1.6, color: 'rgba(247,244,236,0.85)', margin: 0, fontStyle: 'italic' }}>
              Investidores brasileiros em real estate americano. Compilação semanal de 18 indicadores oficiais — Freddie Mac, FRED, Census, NAHB, MBA e S&amp;P CoreLogic.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <DStamp color={D_TONE.accent}>Confidencial</DStamp>
              <DStamp color="rgba(247,244,236,0.5)">Atualizado · Ter</DStamp>
            </div>
          </div>
        </div>
      </header>

      {/* SUMMARY TABLE — invoice line-item style */}
      <section style={{ background: D_TONE.bgPanel, margin: '32px 48px 0', border: `0.5px solid ${D_TONE.rule}`, position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '20px 28px 14px', borderBottom: `0.5px solid ${D_TONE.rule}` }}>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.22em', color: D_TONE.inkMute, textTransform: 'uppercase' }}>Síntese · Posição em 05.05.2026</div>
            <h2 style={{ fontFamily: '"Source Serif 4", Georgia, serif', fontSize: 22, fontWeight: 500, margin: '4px 0 0', letterSpacing: '-0.01em' }}>Quadro resumido da semana</h2>
          </div>
          <DStamp>4 destaques</DStamp>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: `0.5px solid ${D_TONE.rule}` }}>
          {[
            { label: 'Mortgage 30Y Fixa', value: '6,42%', delta: -0.18, unit: 'pp', period: 'sem.', accent: D_TONE.accent },
            { label: 'Case-Shiller Nacional', value: '327,8', delta: 3.4, unit: '%', period: '12 m', accent: D_TONE.ink },
            { label: 'NAHB Sentiment', value: '47', delta: 3, unit: ' pts', period: 'mês', accent: D_TONE.ink },
            { label: 'Affordability', value: '102,4', delta: 4.8, unit: ' pts', period: 'trim.', accent: D_TONE.ink },
          ].map((k, i) => (
            <div key={i} style={{ padding: '20px 24px', borderRight: i < 3 ? `0.5px solid ${D_TONE.rule}` : 'none' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.16em', color: D_TONE.inkMute, textTransform: 'uppercase', marginBottom: 8 }}>{k.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontFamily: '"Source Serif 4", Georgia, serif', fontSize: 36, fontWeight: 400, letterSpacing: '-0.02em', color: k.accent, lineHeight: 1 }}>{k.value}</span>
                <DDelta value={k.delta} unit={k.unit} period={k.period} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: D_TONE.ruleSoft, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.1em', color: D_TONE.inkSoft, textTransform: 'uppercase' }}>
          <span>Demanda em recuperação · construtores otimistas · oferta apertada</span>
          <span>Próxima atualização · 12.MAI.2026 · 14h00 UTC</span>
        </div>
      </section>

      {/* SPOTLIGHT */}
      <section style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 28, padding: '32px 48px' }}>
        <div style={{ background: D_TONE.bgPanel, border: `0.5px solid ${D_TONE.rule}`, padding: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ width: 8, height: 8, background: groups[selected.group].accent }} />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.18em', color: D_TONE.inkMute, textTransform: 'uppercase' }}>{groups[selected.group].label} · indicador em foco</span>
              </div>
              <h3 style={{ fontFamily: '"Source Serif 4", Georgia, serif', fontSize: 28, fontWeight: 400, margin: '4px 0 0', letterSpacing: '-0.02em' }}>{selected.name}</h3>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {['1M', '3M', '6M', '1A', '5A'].map((p, i) => (
                <button key={p} style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 10, padding: '4px 10px',
                  background: i === 3 ? D_TONE.bgBand : 'transparent',
                  color: i === 3 ? D_TONE.inkInverse : D_TONE.inkSoft,
                  border: `0.5px solid ${i === 3 ? D_TONE.bgBand : D_TONE.rule}`,
                  cursor: 'pointer', letterSpacing: '0.06em',
                }}>{p}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, marginBottom: 24, paddingBottom: 16, borderBottom: `0.5px solid ${D_TONE.rule}` }}>
            <span style={{ fontFamily: '"Source Serif 4", Georgia, serif', fontSize: 60, lineHeight: 1, fontWeight: 400, letterSpacing: '-0.03em' }}>{selected.fmt(selected.value)}</span>
            <DDelta value={selected.delta} unit={selected.deltaUnit} period={selected.deltaPeriod} />
          </div>
          <window.AreaChart
            data={selected.series}
            w={720}
            h={dense ? 200 : 240}
            color={D_TONE.accent}
            gridColor="rgba(28,32,39,0.06)"
            axisColor={D_TONE.inkMute}
            label={`d-${selected.id}`}
            formatY={(v) => selected.fmt(v).replace(/[^\d.,\-]/g, '').slice(0, 6)}
          />
          <div style={{ marginTop: 22, paddingTop: 18, borderTop: `0.5px solid ${D_TONE.rule}`, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {[
              ['Mín · 52 sem.', selected.fmt(Math.min(...selected.series))],
              ['Máx · 52 sem.', selected.fmt(Math.max(...selected.series))],
              ['Média 52 sem.', selected.fmt(selected.series.reduce((a,b)=>a+b,0)/selected.series.length)],
              ['Fonte', selected.source],
            ].map(([l, v], i) => (
              <div key={i}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.14em', color: D_TONE.inkMute, textTransform: 'uppercase', marginBottom: 4 }}>{l}</div>
                <div style={{ fontFamily: '"Source Serif 4", Georgia, serif', fontSize: 16 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 22, padding: '18px 22px', background: D_TONE.ruleSoft, borderLeft: `3px solid ${D_TONE.accent}` }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.18em', color: D_TONE.accent, textTransform: 'uppercase', marginBottom: 6 }}>Nota explicativa</div>
            <p style={{ margin: 0, fontFamily: '"Source Serif 4", Georgia, serif', fontSize: 14, fontStyle: 'italic', lineHeight: 1.55, color: D_TONE.inkSoft }}>{selected.why}</p>
          </div>
        </div>

        {/* Aside: editorial timeline */}
        <aside>
          <div style={{ background: D_TONE.bgPanel, border: `0.5px solid ${D_TONE.rule}`, padding: 24, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: 12, marginBottom: 14, borderBottom: `0.5px solid ${D_TONE.rule}` }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.18em', color: D_TONE.inkMute, textTransform: 'uppercase' }}>Crônica da semana</span>
              <DStamp color={D_TONE.accent}>{events.length}</DStamp>
            </div>
            {events.map((e, i) => (
              <div key={i} style={{ position: 'relative', paddingLeft: 22, paddingBottom: i < events.length - 1 ? 14 : 0 }}>
                <div style={{ position: 'absolute', left: 4, top: 5, width: 7, height: 7, borderRadius: '50%', background: i === 0 ? D_TONE.accent : D_TONE.bgPanel, border: `1.5px solid ${i === 0 ? D_TONE.accent : D_TONE.rule}` }} />
                {i < events.length - 1 && <div style={{ position: 'absolute', left: 7, top: 14, bottom: -2, width: 0.5, background: D_TONE.rule }} />}
                <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 3 }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: D_TONE.inkMute, letterSpacing: '0.06em' }}>{e.date}</span>
                  <DStamp color={D_TONE.accent}>{e.tag}</DStamp>
                </div>
                <p style={{ margin: 0, fontFamily: '"Source Serif 4", Georgia, serif', fontSize: 13, lineHeight: 1.5, color: D_TONE.ink }}>{e.text}</p>
              </div>
            ))}
          </div>

          {/* Mini composition */}
          <div style={{ background: D_TONE.bgBand, color: D_TONE.inkInverse, padding: 24, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, opacity: 0.1 }}>
              <DSeal size={80} />
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.18em', color: D_TONE.accent, textTransform: 'uppercase', marginBottom: 14 }}>Composição da carteira</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <window.Donut segments={Object.values(groups).map((g) => ({
                label: g.label,
                value: indicators.filter((i) => i.group === g.id).length,
                color: g.accent,
              }))} size={86} thickness={11} />
              <div style={{ flex: 1, fontSize: 11 }}>
                {Object.values(groups).map((g) => {
                  const n = indicators.filter((i) => i.group === g.id).length;
                  return (
                    <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                      <span style={{ width: 7, height: 7, background: g.accent, borderRadius: 1, flexShrink: 0 }} />
                      <span style={{ flex: 1, color: 'rgba(247,244,236,0.75)' }}>{g.label}</span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', color: D_TONE.accent }}>{n}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>
      </section>

      {/* LEDGER — line-item indicator list */}
      <section style={{ padding: '0 48px 32px' }}>
        <div style={{ background: D_TONE.bgPanel, border: `0.5px solid ${D_TONE.rule}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '22px 28px 16px', borderBottom: `0.5px solid ${D_TONE.rule}` }}>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.18em', color: D_TONE.inkMute, textTransform: 'uppercase' }}>Discriminação · {filtered.length} itens</div>
              <h3 style={{ fontFamily: '"Source Serif 4", Georgia, serif', fontSize: 24, fontWeight: 500, margin: '4px 0 0', letterSpacing: '-0.01em' }}>Os 18 indicadores</h3>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[{ id: 'all', label: 'Todos' }, ...Object.values(groups).map((g) => ({ id: g.id, label: g.label }))].map((g) => (
                <button key={g.id} onClick={() => setActiveGroup(g.id)} style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.08em',
                  padding: '5px 11px',
                  background: activeGroup === g.id ? D_TONE.bgBand : 'transparent',
                  color: activeGroup === g.id ? D_TONE.inkInverse : D_TONE.inkSoft,
                  border: `0.5px solid ${activeGroup === g.id ? D_TONE.bgBand : D_TONE.rule}`,
                  cursor: 'pointer', textTransform: 'uppercase',
                }}>{g.label}</button>
              ))}
            </div>
          </div>
          {/* Header row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: dense ? '14px 90px 1fr 100px 110px 80px' : '16px 110px 1fr 110px 130px 100px',
            gap: 14, padding: '10px 22px',
            background: D_TONE.ruleSoft,
            fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.16em',
            color: D_TONE.inkMute, textTransform: 'uppercase',
            borderBottom: `0.5px solid ${D_TONE.rule}`,
          }}>
            <span></span>
            <span>Código</span>
            <span>Indicador</span>
            <span style={{ textAlign: 'right' }}>Valor</span>
            <span style={{ textAlign: 'right' }}>Variação</span>
            <span>Tendência 52s</span>
          </div>
          {filtered.map((ind) => (
            <DEntry key={ind.id} ind={ind} dense={dense} selected={selected.id === ind.id} onClick={() => setSelected(ind)} />
          ))}
        </div>
      </section>

      {/* REGIONAL */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, padding: '0 48px 32px' }}>
        <div style={{ background: D_TONE.bgPanel, border: `0.5px solid ${D_TONE.rule}`, padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18, paddingBottom: 12, borderBottom: `0.5px solid ${D_TONE.rule}` }}>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.18em', color: D_TONE.inkMute, textTransform: 'uppercase' }}>Anexo I</div>
              <h3 style={{ fontFamily: '"Source Serif 4", Georgia, serif', fontSize: 18, fontWeight: 500, margin: '2px 0 0' }}>Por região censitária</h3>
            </div>
            <DStamp>4 regiões</DStamp>
          </div>
          {regions.map((r, i) => (
            <div key={r.name} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 90px 70px', gap: 14, alignItems: 'center', padding: '14px 0', borderBottom: i < regions.length - 1 ? `0.5px solid ${D_TONE.rule}` : 'none' }}>
              <span style={{ fontFamily: '"Source Serif 4", Georgia, serif', fontSize: 15, color: D_TONE.ink, display: 'flex', alignItems: 'center', gap: 6 }}>
                {r.name}
                {r.hot && <span style={{ width: 5, height: 5, borderRadius: '50%', background: D_TONE.accent }} />}
              </span>
              <window.HBarSimple value={r.sales} max={2000} color={r.hot ? D_TONE.accent : D_TONE.ink} bg={D_TONE.ruleSoft} height={5} />
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, textAlign: 'right' }}>${(r.price/1000).toFixed(0)}k</span>
              <div style={{ textAlign: 'right' }}><DDelta value={r.yoy} unit="%" period="" /></div>
            </div>
          ))}
        </div>
        <div style={{ background: D_TONE.bgPanel, border: `0.5px solid ${D_TONE.rule}`, padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18, paddingBottom: 12, borderBottom: `0.5px solid ${D_TONE.rule}` }}>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.18em', color: D_TONE.inkMute, textTransform: 'uppercase' }}>Anexo II</div>
              <h3 style={{ fontFamily: '"Source Serif 4", Georgia, serif', fontSize: 18, fontWeight: 500, margin: '2px 0 0' }}>Top metros · Sun Belt</h3>
            </div>
            <DStamp>{metros.length} cidades</DStamp>
          </div>
          {metros.slice(0, 8).map((m, i) => (
            <div key={m.name} style={{ display: 'grid', gridTemplateColumns: '20px 1fr 80px 60px 50px', gap: 12, alignItems: 'center', padding: '11px 0', borderBottom: i < 7 ? `0.5px solid ${D_TONE.ruleSoft}` : 'none' }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: D_TONE.inkMute }}>{String(i+1).padStart(2,'0')}</span>
              <span style={{ fontFamily: '"Source Serif 4", Georgia, serif', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                {m.name}
                {m.hot && <span style={{ width: 5, height: 5, borderRadius: '50%', background: D_TONE.accent }} />}
              </span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, textAlign: 'right' }}>${(m.price/1000).toFixed(0)}k</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: m.yoy > 0 ? D_TONE.pos : D_TONE.neg, textAlign: 'right', fontWeight: 500 }}>{m.yoy > 0 ? '+' : ''}{m.yoy.toFixed(1)}%</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: D_TONE.inkMute, textAlign: 'right' }}>{m.dom}d</span>
            </div>
          ))}
        </div>
      </section>

      {/* INVOICE-STYLE FOOTER */}
      <footer style={{
        background: D_TONE.bgBand, color: D_TONE.inkInverse,
        padding: '28px 48px 24px',
        position: 'relative',
        marginTop: 16,
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent 0%, ${D_TONE.accent} 50%, transparent 100%)` }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 32, marginBottom: 22 }}>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.22em', color: D_TONE.accent, textTransform: 'uppercase', marginBottom: 8 }}>Emissor</div>
            <div style={{ fontFamily: '"Source Serif 4", Georgia, serif', fontSize: 13, lineHeight: 1.55, color: 'rgba(247,244,236,0.85)' }}>
              Dissenha Moulding Ltda<br />
              União da Vitória · PR · Brasil
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.22em', color: D_TONE.accent, textTransform: 'uppercase', marginBottom: 8 }}>Fontes</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, lineHeight: 1.7, color: 'rgba(247,244,236,0.7)', letterSpacing: '0.05em' }}>
              FREDDIE MAC · FRED · CENSUS<br />
              NAHB · MBA · S&amp;P CASE-SHILLER
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.22em', color: D_TONE.accent, textTransform: 'uppercase', marginBottom: 8 }}>Cadência</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, lineHeight: 1.7, color: 'rgba(247,244,236,0.7)', letterSpacing: '0.05em' }}>
              TER · 14:00 UTC · 11:00 BRT<br />
              GITHUB ACTIONS · BUILD #1842
            </div>
          </div>
        </div>
        <div style={{ paddingTop: 16, borderTop: `0.5px solid rgba(184,137,58,0.3)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.18em', color: 'rgba(247,244,236,0.5)', textTransform: 'uppercase' }}>
            Documento gerado automaticamente · Não constitui recomendação de investimento
          </span>
          <DSeal size={28} />
        </div>
      </footer>
    </div>
  );
}

Object.assign(window, { DVariation });
