import { useCallback, useEffect, useMemo, useState, startTransition } from 'react';
import { predictQualityForTargetPsnr } from '../core/ai/qPredictor';
import {
  computeRdCurve,
  createDemoImageData,
  grayToCanvas,
  imageDataToGray,
  loadImageFromFile,
  runPipeline,
} from '../core/jpeg/pipeline';
import type { PipelineResult, RdPoint, TabId } from '../types';
import { useDebouncedValue } from './useDebouncedValue';

const QUALITY_DEBOUNCE_MS = 180;
const PSNR_DEBOUNCE_MS = 80;

export function useJpegPipeline() {
  const [quality, setQuality] = useState(50);
  const [targetPsnr, setTargetPsnr] = useState(32);
  const [debouncedQuality, flushQuality] = useDebouncedValue(
    quality,
    QUALITY_DEBOUNCE_MS,
  );
  const [debouncedTargetPsnr, flushTargetPsnr] = useDebouncedValue(
    targetPsnr,
    PSNR_DEBOUNCE_MS,
  );
  const [activeTab, setActiveTab] = useState<TabId>('compare');
  const [selectedBlockRow, setSelectedBlockRow] = useState(0);
  const [selectedBlockCol, setSelectedBlockCol] = useState(0);
  const [pixels, setPixels] = useState<{
    data: Float32Array;
    width: number;
    height: number;
  } | null>(null);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [rdCurve, setRdCurve] = useState<RdPoint[]>([]);
  const [theoreticalRd, setTheoreticalRd] = useState<RdPoint[]>([]);
  const [computingRd, setComputingRd] = useState(false);

  const aiRecommendedQ = useMemo(() => {
    if (!result) return null;
    return predictQualityForTargetPsnr(result.sourceStats, debouncedTargetPsnr);
  }, [result?.sourceStats, debouncedTargetPsnr]);

  const processImage = useCallback(
    (
      pixelData: Float32Array,
      width: number,
      height: number,
      q: number,
      blockRow: number,
      blockCol: number,
    ) => {
      startTransition(() => {
        const pipelineResult = runPipeline(
          pixelData,
          width,
          height,
          q,
          blockRow,
          blockCol,
        );
        setResult(pipelineResult);
      });
    },
    [],
  );

  const handleFileSelect = useCallback(async (file: File) => {
    const imageData = await loadImageFromFile(file);
    const { pixels: gray, width, height } = imageDataToGray(imageData);
    setPixels({ data: gray, width, height });
    setSelectedBlockRow(0);
    setSelectedBlockCol(0);
  }, []);

  const loadDemoImage = useCallback(() => {
    const imageData = createDemoImageData(256);
    const { pixels: gray, width, height } = imageDataToGray(imageData);
    setPixels({ data: gray, width, height });
    setSelectedBlockRow(0);
    setSelectedBlockCol(0);
  }, []);

  useEffect(() => {
    if (!pixels) return;
    processImage(
      pixels.data,
      pixels.width,
      pixels.height,
      debouncedQuality,
      selectedBlockRow,
      selectedBlockCol,
    );
  }, [
    pixels,
    debouncedQuality,
    selectedBlockRow,
    selectedBlockCol,
    processImage,
  ]);

  useEffect(() => {
    if (!pixels) return;

    setComputingRd(true);
    const timer = window.setTimeout(() => {
      startTransition(() => {
        const { rdCurve: curve, theoreticalRd: theory } = computeRdCurve(
          pixels.data,
          pixels.width,
          pixels.height,
          15,
        );
        setRdCurve(curve);
        setTheoreticalRd(theory);
        setComputingRd(false);
      });
    }, 100);

    return () => window.clearTimeout(timer);
  }, [pixels]);

  const originalCanvas = useMemo(() => {
    if (!result) return null;
    return grayToCanvas(result.originalGray, result.width, result.height);
  }, [result]);

  const reconstructedCanvas = useMemo(() => {
    if (!result) return null;
    return grayToCanvas(
      result.reconstructedGray,
      result.width,
      result.height,
    );
  }, [result]);

  const applyAiQ = useCallback(() => {
    if (aiRecommendedQ !== null) {
      setQuality(aiRecommendedQ);
      flushQuality();
    }
  }, [aiRecommendedQ, flushQuality]);

  const selectBlock = useCallback((row: number, col: number) => {
    setSelectedBlockRow(row);
    setSelectedBlockCol(col);
  }, []);

  return {
    quality,
    setQuality,
    flushQuality,
    targetPsnr,
    setTargetPsnr,
    flushTargetPsnr,
    activeTab,
    setActiveTab,
    selectedBlockRow,
    selectedBlockCol,
    result,
    rdCurve,
    theoreticalRd,
    computingRd,
    aiRecommendedQ,
    originalCanvas,
    reconstructedCanvas,
    hasImage: pixels !== null,
    handleFileSelect,
    loadDemoImage,
    applyAiQ,
    selectBlock,
  };
}
