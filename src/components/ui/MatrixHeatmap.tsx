import type { Matrix8x8 } from '../../types';

interface MatrixHeatmapProps {
  matrix: Matrix8x8;
  title: string;
  highlightZeros?: boolean;
  offset?: number;
  decimals?: number;
  large?: boolean;
}

function getColor(value: number, min: number, max: number): string {
  if (max === min) return '#ffffff';
  const t = (value - min) / (max - min);
  const gray = Math.round(255 * (1 - t));
  return `rgb(${gray}, ${gray}, ${gray})`;
}

export function MatrixHeatmap({
  matrix,
  title,
  highlightZeros = false,
  offset = 0,
  decimals = 1,
  large = false,
}: MatrixHeatmapProps) {
  const flat = matrix.flat().map((v) => v + offset);
  const min = Math.min(...flat);
  const max = Math.max(...flat);

  return (
    <div className={`section-card matrix-heatmap ${large ? 'matrix-heatmap--large' : ''}`}>
      <div className="section-card__header">
        <h4 className="matrix-heatmap__title">{title}</h4>
      </div>
      <div className="section-card__body matrix-heatmap__body">
        <table className="matrix-heatmap__table">
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => {
                  const displayVal = cell + offset;
                  const isZero = highlightZeros && cell === 0;
                  return (
                    <td
                      key={j}
                      className={`matrix-heatmap__cell ${isZero ? 'matrix-heatmap__cell--zero' : ''}`}
                      style={
                        isZero
                          ? undefined
                          : {
                              backgroundColor: getColor(displayVal, min, max),
                              color:
                                displayVal > (min + max) / 2 ? '#fff' : '#000',
                            }
                      }
                    >
                      {Number.isInteger(displayVal)
                        ? displayVal
                        : displayVal.toFixed(decimals)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
