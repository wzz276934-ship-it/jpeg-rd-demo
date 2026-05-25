import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathFormulaProps {
  tex: string;
  display?: boolean;
}

export function MathFormula({ tex, display = true }: MathFormulaProps) {
  const html = useMemo(
    () =>
      katex.renderToString(tex, {
        throwOnError: false,
        displayMode: display,
        strict: 'ignore',
      }),
    [tex, display],
  );

  return (
    <div
      className={`math-formula ${display ? 'math-formula--display' : ''}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
