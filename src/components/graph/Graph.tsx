import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { evaluateExpressionSafe } from '@/hooks/useExpressionEvaluator';

export interface GraphPanelProps {
  expression: string;
}

const GraphPanel: React.FC<GraphPanelProps> = ({ expression }) => {
  const [view, setView] = useState<{ xMin: number; xMax: number; yMin: number; yMax: number; }>({ xMin: -10, xMax: 10, yMin: -10, yMax: 10 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{x: number; y: number} | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isPanning || !panStart) return;
      const dx = e.movementX;
      const width = (svgRef.current?.clientWidth) || 1;
      const factor = (view.xMax - view.xMin) / width;
      setView(v => ({ ...v, xMin: v.xMin - dx * factor, xMax: v.xMax - dx * factor }));
    };
    const onUp = () => { setIsPanning(false); setPanStart(null); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [isPanning, panStart, view.xMax, view.xMin]);

  const toScreenX = useCallback((x: number) => {
    const w = 600; // default width for calculation, actual width is provided by SVG viewBox
    const ratio = (x - view.xMin) / (view.xMax - view.xMin);
    return ratio * w;
  }, [view.xMin, view.xMax]);

  const toScreenY = useCallback((y: number) => {
    // Map y in [yMin, yMax] to SVG height; we'll use same 400 px height assumption
    const h = 400;
    const ratio = (yMax(view.yMin, view.yMax) - y) / (view.yMax - view.yMin);
    return ratio * h;
  }, [view.yMin, view.yMax]);

  function yMax(a: number, b: number) { return Math.max(a, b); }
  // Generate path data for function y = f(x)
  const pathD = useMemo(() => {
    const samples = 200;
    const width = 600;
    const height = 400;
    let d = '';
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const x = view.xMin + t * (view.xMax - view.xMin);
      let y = 0;
      try { y = evaluateExpressionSafe(expression, x); } catch { continue; }
      const sx = (t) * width; // simple mapping across width
      const sy = height / 2 - y * (height / (view.yMax - view.yMin));
      d += (i === 0 ? 'M' : 'L') + ' ' + sx.toFixed(2) + ' ' + sy.toFixed(2);
    }
    return d;
  }, [expression, view.xMin, view.xMax, view.yMin, view.yMax]);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    const cursorX = e.nativeEvent.offsetX;
    const width = (svgRef.current?.clientWidth) || 600;
    const centerX = view.xMin + (cursorX / width) * (view.xMax - view.xMin);
    const newXMin = centerX - (centerX - view.xMin) * zoomFactor;
    const newXMax = centerX + (view.xMax - centerX) * zoomFactor;
    const newYMin = view.yMin * zoomFactor; // simple vertical scale
    const newYMax = view.yMax * zoomFactor;
    setView({ xMin: newXMin, xMax: newXMax, yMin: newYMin, yMax: newYMax });
  };

  const startPan = (e: React.MouseEvent) => {
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
  };

  const exportSVG = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'nimbus_graph.svg'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Simple fallback if expression can't be evaluated for all x
  const hasValidExpression = useMemo(() => !!expression && typeof expression === 'string', [expression]);

  return (
    <div className="card" aria-label="graph-panel">
      <div className="card-header">
        <div className="card-title">2D Graphing</div>
        <button className="btn secondary" onClick={exportSVG} aria-label="export-svg">Export SVG</button>
      </div>
      <div
        onWheel={onWheel}
        onMouseDown={startPan}
        style={{ width: '100%', height: 420, cursor: 'grab' }}
      >
        <svg ref={svgRef} width="100%" height="420" viewBox="0 0 600 400" role="img" aria-label="graph-area" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grid" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#eee" offset="0"/>
              <stop stopColor="#ddd" offset="1"/>
            </linearGradient>
          </defs>
          {/* Grid */}
          {Array.from({ length: 20 }).map((_, i) => (
            <line key={i} x1={0} y1={i * (400/20)} x2={600} y2={i * (400/20)} stroke="#e5e7eb" strokeWidth={1} />
          ))}
          {Array.from({ length: 30 }).map((_, i) => (
            <line key={'v'+i} x1={i * (600/30)} y1={0} x2={i * (600/30)} y2={400} stroke="#e5e7eb" strokeWidth={1} />
          ))}
          {/* Axes */}
          <line x1={0} y1={200} x2={600} y2={200} stroke="#888" strokeWidth={1} />
          <line x1={300} y1={0} x2={300} y2={400} stroke="#888" strokeWidth={1} />
          {/* Graph path */}
          {hasValidExpression && <path d={pathD} fill="none" stroke="#003d82" strokeWidth={2} />}
        </svg>
      </div>
    </div>
  );
};

export default GraphPanel;
