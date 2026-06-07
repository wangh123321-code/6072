import { useState, useRef, useCallback, useEffect } from 'react';

interface UseTimelineDragOptions {
  minScale?: number;
  maxScale?: number;
  scaleStep?: number;
  onScaleChange?: (scale: number) => void;
  onOffsetChange?: (offset: number) => void;
}

interface UseTimelineDragReturn {
  scale: number;
  offset: number;
  isDragging: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
  handleWheel: (e: React.WheelEvent) => void;
  handleMouseDown: (e: React.MouseEvent) => void;
  setScale: (scale: number) => void;
  setOffset: (offset: number) => void;
}

export function useTimelineDrag(options: UseTimelineDragOptions = {}): UseTimelineDragReturn {
  const {
    minScale = 0.5,
    maxScale = 3.0,
    scaleStep = 0.1,
    onScaleChange,
    onOffsetChange,
  } = options;

  const [scale, setScaleState] = useState(1);
  const [offset, setOffsetState] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startOffsetRef = useRef(0);
  const isDraggingRef = useRef(false);

  const setScale = useCallback((newScale: number) => {
    const clamped = Math.max(minScale, Math.min(maxScale, newScale));
    setScaleState(clamped);
    onScaleChange?.(clamped);
  }, [minScale, maxScale, onScaleChange]);

  const setOffset = useCallback((newOffset: number) => {
    setOffsetState(newOffset);
    onOffsetChange?.(newOffset);
  }, [onOffsetChange]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -scaleStep : scaleStep;
    setScale(scale + delta);
  }, [scale, scaleStep, setScale]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    startXRef.current = e.clientX;
    startOffsetRef.current = offset;
    isDraggingRef.current = true;
    setIsDragging(true);
  }, [offset]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - startXRef.current;
      setOffset(startOffsetRef.current + deltaX);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [setOffset]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=') {
          e.preventDefault();
          setScale(scale + scaleStep);
        } else if (e.key === '-') {
          e.preventDefault();
          setScale(scale - scaleStep);
        } else if (e.key === '0') {
          e.preventDefault();
          setScale(1);
          setOffset(0);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scale, scaleStep, setScale, setOffset]);

  return {
    scale,
    offset,
    isDragging,
    containerRef,
    handleWheel,
    handleMouseDown,
    setScale,
    setOffset,
  };
}
