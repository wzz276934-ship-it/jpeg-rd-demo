import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  usePlotArea,
} from 'recharts';
import type { RdPoint } from '../../types';
import {
  type ChartPlotOffset,
  computeYBounds,
  getWheelZoomZone,
  RD_CHART_MARGIN,
  RD_MIN_X_SPAN,
  RD_MIN_Y_SPAN,
  RD_X_BOUNDS,
  panDomain,
  zoomDomainAround,
} from './rdChartZoom';

interface RdCurveChartProps {
  experimental: { rate: number; distortion: number; quality: number }[];
  theoretical: { rate: number; distortion: number }[];
  currentPoint?: RdPoint;
  onPointSelect?: (quality: number) => void;
}

interface ViewDomains {
  x: [number, number];
  y: [number, number];
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function PlotAreaSync({
  onPlotArea,
}: {
  onPlotArea: (plot: ChartPlotOffset) => void;
}) {
  const plotArea = usePlotArea();

  useEffect(() => {
    if (plotArea && plotArea.width > 0 && plotArea.height > 0) {
      onPlotArea({
        left: plotArea.x,
        top: plotArea.y,
        width: plotArea.width,
        height: plotArea.height,
      });
    }
  }, [plotArea, onPlotArea]);

  return null;
}

function fallbackPlotArea(container: HTMLDivElement): ChartPlotOffset | null {
  const { width, height } = container.getBoundingClientRect();
  if (width <= 0 || height <= 0) return null;

  const legendBand = 28;
  const plotWidth = width - RD_CHART_MARGIN.left - RD_CHART_MARGIN.right;
  const plotHeight =
    height - RD_CHART_MARGIN.top - RD_CHART_MARGIN.bottom - legendBand;

  if (plotWidth <= 0 || plotHeight <= 0) return null;

  return {
    left: RD_CHART_MARGIN.left,
    top: RD_CHART_MARGIN.top + legendBand,
    width: plotWidth,
    height: plotHeight,
  };
}

const PAN_CLICK_THRESHOLD = 4;

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  xDomain: [number, number];
  yDomain: [number, number];
}

export function RdCurveChart({
  experimental,
  theoretical,
  currentPoint,
  onPointSelect,
}: RdCurveChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const plotOffsetRef = useRef<ChartPlotOffset | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const didPanRef = useRef(false);
  const pointerRef = useRef({ x: 0, y: 0 });
  const panFrameRef = useRef<number | null>(null);
  const viewDomainsRef = useRef<ViewDomains>({
    x: RD_X_BOUNDS,
    y: [0, 1],
  });
  const yBoundsRef = useRef<[number, number]>([0, 1]);

  const yBounds = useMemo(
    () => computeYBounds(experimental, theoretical),
    [experimental, theoretical],
  );

  const defaultDomains = useMemo<ViewDomains>(
    () => ({
      x: RD_X_BOUNDS,
      y: yBounds,
    }),
    [yBounds],
  );

  const [viewDomains, setViewDomains] = useState<ViewDomains>(() => ({
    x: RD_X_BOUNDS,
    y: yBounds,
  }));
  const [isZoomed, setIsZoomed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  yBoundsRef.current = yBounds;
  viewDomainsRef.current = viewDomains;

  const resolvePlotArea = useCallback((element: HTMLDivElement) => {
    return plotOffsetRef.current ?? fallbackPlotArea(element);
  }, []);

  const handleOffset = useCallback((offset: ChartPlotOffset) => {
    plotOffsetRef.current = offset;
  }, []);

  useEffect(() => {
    setViewDomains(defaultDomains);
    setIsZoomed(false);
  }, [defaultDomains.x[0], defaultDomains.x[1], defaultDomains.y[0], defaultDomains.y[1]]);

  const resetZoom = useCallback(() => {
    setViewDomains(defaultDomains);
    setIsZoomed(false);
  }, [defaultDomains]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const applyPanFromPointer = () => {
      const drag = dragRef.current;
      if (!drag) return false;

      const plot = resolvePlotArea(element);
      if (!plot) return false;

      const dx = pointerRef.current.x - drag.startX;
      const dy = pointerRef.current.y - drag.startY;

      if (
        Math.abs(dx) > PAN_CLICK_THRESHOLD ||
        Math.abs(dy) > PAN_CLICK_THRESHOLD
      ) {
        didPanRef.current = true;
      }

      const xSpan = drag.xDomain[1] - drag.xDomain[0];
      const ySpan = drag.yDomain[1] - drag.yDomain[0];
      const deltaX = -(dx / plot.width) * xSpan;
      const deltaY = (dy / plot.height) * ySpan;

      setViewDomains({
        x: panDomain(drag.xDomain, deltaX, RD_X_BOUNDS),
        y: panDomain(drag.yDomain, deltaY, yBoundsRef.current),
      });
      setIsZoomed(true);
      return true;
    };

    const schedulePan = () => {
      if (panFrameRef.current != null) return;
      panFrameRef.current = window.requestAnimationFrame(() => {
        panFrameRef.current = null;
        applyPanFromPointer();
      });
    };

    const finishDrag = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      if (panFrameRef.current != null) {
        window.cancelAnimationFrame(panFrameRef.current);
        panFrameRef.current = null;
      }

      pointerRef.current = { x: event.clientX, y: event.clientY };
      applyPanFromPointer();

      element.classList.remove('rd-chart-zoom__canvas--dragging');
      setIsDragging(false);

      if (element.hasPointerCapture(event.pointerId)) {
        element.releasePointerCapture(event.pointerId);
      }

      dragRef.current = null;
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      if (!resolvePlotArea(element)) return;

      const domains = viewDomainsRef.current;
      dragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        xDomain: domains.x,
        yDomain: domains.y,
      };
      pointerRef.current = { x: event.clientX, y: event.clientY };
      didPanRef.current = false;
      element.classList.add('rd-chart-zoom__canvas--dragging');
      setIsDragging(true);
      element.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      pointerRef.current = { x: event.clientX, y: event.clientY };
      schedulePan();
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

      const plot = resolvePlotArea(element);
      if (!plot) return;

      const rect = element.getBoundingClientRect();
      const chartX = event.clientX - rect.left;
      const chartY = event.clientY - rect.top;
      const zone = getWheelZoomZone(chartX, chartY, plot);
      if (zone === 'none') return;

      const xRatio = clamp01((chartX - plot.left) / plot.width);
      const yRatio = clamp01(1 - (chartY - plot.top) / plot.height);
      const factor = event.deltaY > 0 ? 1.12 : 0.88;

      setViewDomains((prev) => {
        let nextX = prev.x;
        let nextY = prev.y;

        if (zone === 'plot' || zone === 'x-axis') {
          const centerX = prev.x[0] + xRatio * (prev.x[1] - prev.x[0]);
          nextX = zoomDomainAround(
            prev.x,
            centerX,
            xRatio,
            factor,
            RD_MIN_X_SPAN,
            RD_X_BOUNDS,
          );
        }

        if (zone === 'plot' || zone === 'y-axis') {
          const centerY = prev.y[0] + yRatio * (prev.y[1] - prev.y[0]);
          nextY = zoomDomainAround(
            prev.y,
            centerY,
            yRatio,
            factor,
            RD_MIN_Y_SPAN,
            yBoundsRef.current,
          );
        }

        return { x: nextX, y: nextY };
      });

      setIsZoomed(true);
    };

    element.addEventListener('pointerdown', handlePointerDown);
    element.addEventListener('pointermove', handlePointerMove);
    element.addEventListener('pointerup', finishDrag);
    element.addEventListener('pointercancel', finishDrag);
    element.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('pointermove', handlePointerMove);
      element.removeEventListener('pointerup', finishDrag);
      element.removeEventListener('pointercancel', finishDrag);
      element.removeEventListener('wheel', handleWheel);
      if (panFrameRef.current != null) {
        window.cancelAnimationFrame(panFrameRef.current);
      }
      element.classList.remove('rd-chart-zoom__canvas--dragging');
    };
  }, [resolvePlotArea]);

  return (
    <div className="rd-chart-zoom">
      <div className="rd-chart-zoom__toolbar">
        <span className="rd-chart-zoom__hint">
          图像区滚轮双轴缩放 · X/Y 轴上滚轮单轴缩放 · 拖拽平移
        </span>
        {isZoomed && (
          <button type="button" className="rd-chart-zoom__reset" onClick={resetZoom}>
            重置视图
          </button>
        )}
      </div>
      <div
        ref={containerRef}
        className={`rd-chart-zoom__canvas${isDragging ? ' rd-chart-zoom__canvas--dragging' : ''}`}
        onDoubleClick={resetZoom}
        title="图像区滚轮双轴缩放，X/Y轴滚轮单轴缩放，拖拽平移，双击重置"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart margin={RD_CHART_MARGIN}>
            <PlotAreaSync onPlotArea={handleOffset} />
            <CartesianGrid stroke="#e5e5e5" />
            <XAxis
              dataKey="distortion"
              type="number"
              scale="linear"
              domain={viewDomains.x}
              allowDataOverflow
              tickCount={6}
              label={{
                value: '失真 D (MSE)',
                position: 'insideBottom',
                offset: -4,
                style: { fontFamily: 'JetBrains Mono', fontSize: 11 },
              }}
              tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
              stroke="#000"
            />
            <YAxis
              dataKey="rate"
              type="number"
              scale="linear"
              domain={viewDomains.y}
              allowDataOverflow
              tickCount={6}
              label={{
                value: '码率 R (bit/pixel)',
                angle: -90,
                position: 'insideLeft',
                offset: 12,
                style: { fontFamily: 'JetBrains Mono', fontSize: 11 },
              }}
              tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
              stroke="#000"
            />
            <Tooltip
              active={isDragging ? false : undefined}
              isAnimationActive={false}
              contentStyle={{
                background: '#fff',
                border: '1px solid #000',
                borderRadius: 0,
                fontFamily: 'JetBrains Mono',
                fontSize: 12,
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: 11, paddingBottom: 8 }}
            />
            <Line
              data={theoretical}
              type="monotone"
              dataKey="rate"
              stroke="#525252"
              strokeDasharray="6 4"
              dot={false}
              isAnimationActive={false}
              name="理论下界 R(D)"
            />
            <Line
              data={experimental}
              type="monotone"
              dataKey="rate"
              stroke="#000000"
              strokeWidth={2}
              isAnimationActive={false}
              dot={(props) => {
                const { cx, cy, payload } = props as {
                  cx?: number;
                  cy?: number;
                  payload?: { quality: number };
                };
                if (cx == null || cy == null) return null;
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill="#fff"
                    stroke="#000"
                    strokeWidth={2}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      if (didPanRef.current || payload?.quality == null) return;
                      onPointSelect?.(payload.quality);
                    }}
                  />
                );
              }}
              activeDot={isDragging ? false : { r: 6, fill: '#000' }}
              name="JPEG 实验曲线"
            />
            {currentPoint && (
              <ReferenceDot
                x={currentPoint.distortion}
                y={currentPoint.rate}
                r={8}
                fill="#000"
                stroke="#fff"
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
