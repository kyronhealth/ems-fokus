import type { Exhibit as Ex } from '../lib/types';

export default function Exhibit({ ex }: { ex: Ex }) {
  if ('rows' in ex) {
    return (
      <div className="card exbox">
        <p className="extitle">{ex.title}</p>
        <table className="ex">
          <thead><tr>{ex.head.map(h => <th key={h} scope="col">{h}</th>)}</tr></thead>
          <tbody>{ex.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
        </table>
        {ex.note && <p className="small muted">{ex.note}</p>}
      </div>
    );
  }
  const W = 380, H = 250, pl = 40, pr = 8, pt = 24, pb = 42;
  const max = Math.ceil(Math.max(...ex.values) / 100) * 100 || 100;
  const steps = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(max * f));
  const bw = (W - pl - pr) / ex.values.length;
  const y = (v: number) => pt + (H - pt - pb) * (1 - v / max);
  const label = `${ex.title}: ` + ex.labels.map((l, k) => `${ex.xLabel} ${l} ${ex.values[k]}`).join(', ');
  return (
    <div className="card exbox">
      <p className="extitle">{ex.title}</p>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
        {steps.map(v => (
          <g key={v}>
            <line className="grid" x1={pl} x2={W - pr} y1={y(v)} y2={y(v)} />
            <text x={pl - 8} y={y(v) + 4} textAnchor="end">{v}</text>
          </g>
        ))}
        {ex.values.map((v, k) => {
          const x = pl + k * bw + bw * 0.18, w = bw * 0.64;
          return (
            <g key={k}>
              <rect className="barr" x={x} y={y(v)} width={w} height={y(0) - y(v)} rx={3} />
              <text className="val" x={x + w / 2} y={y(v) - 6} textAnchor="middle">{v}</text>
              <text x={x + w / 2} y={H - pb + 18} textAnchor="middle">{ex.labels[k]}</text>
            </g>
          );
        })}
        <text x={(W + pl) / 2} y={H - 4} textAnchor="middle">{ex.xLabel}</text>
      </svg>
    </div>
  );
}
