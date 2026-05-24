import type { HuffmanEntry, RleSymbol } from '../../types';

interface HuffmanNode {
  symbol?: string;
  weight: number;
  left?: HuffmanNode;
  right?: HuffmanNode;
}

function buildTree(frequencies: Map<string, number>): HuffmanNode | null {
  const nodes: HuffmanNode[] = [...frequencies.entries()].map(
    ([symbol, weight]) => ({ symbol, weight }),
  );

  if (nodes.length === 0) return null;
  if (nodes.length === 1) {
    return {
      weight: nodes[0].weight,
      left: nodes[0],
    };
  }

  while (nodes.length > 1) {
    nodes.sort((a, b) => a.weight - b.weight);
    const left = nodes.shift()!;
    const right = nodes.shift()!;
    nodes.push({
      weight: left.weight + right.weight,
      left,
      right,
    });
  }

  return nodes[0];
}

function collectCodes(
  node: HuffmanNode | undefined,
  prefix: string,
  table: Map<string, string>,
): void {
  if (!node) return;
  if (node.symbol !== undefined) {
    table.set(node.symbol, prefix.length > 0 ? prefix : '0');
    return;
  }
  collectCodes(node.left, prefix + '0', table);
  collectCodes(node.right, prefix + '1', table);
}

export function buildHuffmanTable(symbols: RleSymbol[]): HuffmanEntry[] {
  const frequencies = new Map<string, number>();
  const total = symbols.length;

  for (const symbol of symbols) {
    const key = `(${symbol.run},${symbol.magnitude})`;
    frequencies.set(key, (frequencies.get(key) ?? 0) + 1);
  }

  const tree = buildTree(frequencies);
  const codeMap = new Map<string, string>();
  collectCodes(tree ?? undefined, '', codeMap);

  return [...frequencies.entries()]
    .map(([symbol, count]) => {
      const code = codeMap.get(symbol) ?? '';
      const probability = count / total;
      return {
        symbol,
        code,
        probability,
        codeLength: code.length,
      };
    })
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 16);
}

export function computeAverageCodeLength(
  symbols: RleSymbol[],
  table: HuffmanEntry[],
): number {
  const lookup = new Map(table.map((entry) => [entry.symbol, entry.codeLength]));
  let totalLength = 0;

  for (const symbol of symbols) {
    const key = `(${symbol.run},${symbol.magnitude})`;
    totalLength += lookup.get(key) ?? Math.max(4, key.length);
  }

  return symbols.length > 0 ? totalLength / symbols.length : 0;
}

export function estimateTotalBits(
  allRle: RleSymbol[],
  table: HuffmanEntry[],
): number {
  const avgLen = computeAverageCodeLength(allRle, table);
  return Math.round(avgLen * allRle.length);
}
