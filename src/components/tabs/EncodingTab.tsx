import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PipelineResult } from '../../types';

interface EncodingTabProps {
  result: PipelineResult;
}

export function EncodingTab({ result }: EncodingTabProps) {
  const { encoding, sourceStats } = result;

  const comparisonData = [
    { name: '信源熵 H(X)', value: sourceStats.entropy },
    { name: '平均码长 L', value: encoding.averageCodeLength },
  ];

  return (
    <div className="stack">
      <div className="section-card">
        <div className="section-card__header">
          <h4>Zigzag 扫描序列</h4>
        </div>
        <div className="section-card__body">
          <div className="zigzag-strip">
            {encoding.zigzag.map((value, i) => (
              <div
                key={i}
                className={`zigzag-cell ${value === 0 ? 'zigzag-cell--zero' : 'zigzag-cell--nonzero'}`}
              >
                {value}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="matrix-grid">
        <div className="section-card">
          <div className="section-card__header">
            <h4>游程编码 (RLE)</h4>
          </div>
          <div className="section-card__body" style={{ maxHeight: '16rem', overflowY: 'auto', padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>序号</th>
                  <th>(游程, 幅值)</th>
                </tr>
              </thead>
              <tbody>
                {encoding.rle.map((symbol, i) => (
                  <tr key={i}>
                    <td>{i}</td>
                    <td>({symbol.run}, {symbol.magnitude})</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="section-card">
          <div className="section-card__header">
            <h4>霍夫曼编码表</h4>
          </div>
          <div className="section-card__body" style={{ maxHeight: '16rem', overflowY: 'auto', padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>符号</th>
                  <th>码字</th>
                  <th>P</th>
                </tr>
              </thead>
              <tbody>
                {encoding.huffmanTable.map((entry, i) => (
                  <tr key={i}>
                    <td>{entry.symbol}</td>
                    <td>{entry.code}</td>
                    <td>{entry.probability.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="section-card">
        <div className="section-card__header">
          <h4>平均码长 vs 信源熵</h4>
          <p className="section-card__desc">验证定理 4.6.1：L ≥ H(X)</p>
        </div>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <CartesianGrid stroke="#e5e5e5" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} stroke="#000" />
              <YAxis tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} stroke="#000" />
              <Tooltip
                contentStyle={{
                  background: '#fff',
                  border: '1px solid #000',
                  borderRadius: 0,
                  fontFamily: 'JetBrains Mono',
                }}
              />
              <Bar dataKey="value" fill="#000000" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="stat-row">
          <div className="stat-cell">
            <p className="stat-cell__label">总比特数</p>
            <p className="stat-cell__value">{encoding.totalBits.toLocaleString()}</p>
          </div>
          <div className="stat-cell">
            <p className="stat-cell__label">码率</p>
            <p className="stat-cell__value">{encoding.bitRate.toFixed(4)} bit/px</p>
          </div>
          <div className="stat-cell">
            <p className="stat-cell__label">L ≥ H(X)</p>
            <p className="stat-cell__value">
              {encoding.averageCodeLength >= sourceStats.entropy ? '✓ 成立' : '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
