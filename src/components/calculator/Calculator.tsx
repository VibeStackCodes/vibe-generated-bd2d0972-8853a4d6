import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { evaluateExpressionSafe } from '@/hooks/useExpressionEvaluator';
import { HistoryItem } from '@/types';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { addHistory, loadHistory, saveHistory } from '@/services/historyService';

export interface CalculatorProps {
  onAddHistory?: (item: HistoryItem) => void;
  initialExpression?: string;
  placeholder?: string;
}

export const CalculatorPanel: React.FC<CalculatorProps> = ({ onAddHistory }) => {
  const [expression, setExpression] = useState<string>("2*x + 3");
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to read initial expression if provided by parent in future
    if (typeof window !== 'undefined' && (window as any).__NimbusInitExpr) {
      const v = (window as any).__NimbusInitExpr;
      setExpression(String(v));
    }
  }, []);

  const compute = useCallback(() => {
    try {
      const value = evaluateExpressionSafe(expression);
      setResult(value);
      setError(null);
      if (onAddHistory) {
        const item: HistoryItem = {
          id: Math.random().toString(36).slice(2),
          expression,
          result: value,
          timestamp: new Date().toISOString()
        };
        onAddHistory(item);
      }
    } catch (e: any) {
      setResult(null);
      setError(e?.message ?? 'Invalid expression');
    }
  }, [expression, onAddHistory]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'enter') {
      e.preventDefault();
      compute();
    }
  };

  return (
    <div className="card" aria-label="calculator-panel">
      <div className="card-header">
        <div className="card-title">Offline Calculator</div>
        <span className="legend" aria-label="privacy-status">Offline-first • Local storage</span>
      </div>
      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label htmlFor="expr" style={{ display: 'block', marginBottom: 6 }}>Expression</label>
          <input id="expr" className="input" placeholder="e.g., sin(pi/2) + x" value={expression} onChange={e => setExpression(e.target.value)} onKeyDown={handleKeyDown} aria-label="expression-input" />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6 }}>Result</label>
          <div className={cn('input')} style={{ height: 40, display: 'flex', alignItems: 'center', paddingLeft: 10 }} aria-live="polite">{result !== null ? result : '-'}</div>
        </div>
      </div>
      {error && (
        <div role="alert" style={{ color: '#b91c1c', marginTop: 8 }}>{error}</div>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button className="btn" onClick={compute} aria-label="evaluate">Evaluate</button>
        <button className="btn secondary" onClick={() => { setExpression(''); setResult(null); setError(null); }} aria-label="clear">Clear</button>
      </div>
    </div>
  );
};

export default CalculatorPanel;
