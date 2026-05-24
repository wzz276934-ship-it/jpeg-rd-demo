import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { HistogramBin } from '../../types';

interface HistogramChartProps {
  histogram: HistogramBin[];
  entropy: number;
}

export function HistogramChart({ histogram, entropy }: HistogramChartProps) {
  const data = histogram.map((bin) => ({
    value: bin.value,
    count: bin.count,
    probability: bin.probability,
  }));

  return (
    <div className="section-card">
      <div className="section-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h4>信源分析</h4>
        <span className="control-field__value">H(X) = {entropy.toFixed(4)} bit/pixel</span>
      </div>
      <div className="chart-box">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="#e5e5e5" vertical={false} />
            <XAxis dataKey="value" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} stroke="#000" />
            <YAxis tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} stroke="#000" />
            <Tooltip
              contentStyle={{
                background: '#fff',
                border: '1px solid #000',
                borderRadius: 0,
                fontFamily: 'JetBrains Mono',
                fontSize: 12,
              }}
            />
            <Bar dataKey="count" fill="#000000" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="section-card__desc" style={{ padding: '0 1.5rem 1.5rem' }}>
        理论上每个像素最少需要 {entropy.toFixed(3)} bit — 这是整个系统的理论基准线（第2章 信源熵）
      </p>
    </div>
  );
}
