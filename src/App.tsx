import React, { useEffect, useMemo, useState } from 'react';
import CalculatorPanel from './components/calculator/Calculator';
import GraphPanel from './components/graph/Graph';
import { HistoryPanel } from './components/history/HistoryPanel';
import { HistoryItem } from './types';
import { loadHistory, saveHistory, addHistory, clearHistory } from './services/historyService';
import { formatDate } from './lib/utils';
import { Button } from './components/ui/Button';
import { evaluateExpressionSafe } from './hooks/useExpressionEvaluator';

import './styles/globals.css';

export const App: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [expressionForGraph, setExpressionForGraph] = useState<string>("x^2");
  const [proEnabled, setProEnabled] = useState<boolean>(false);
  const [shortcuts, setShortcuts] = useState<{ evaluate: string; clear: string }>({ evaluate: 'Ctrl+Enter', clear: 'Ctrl+L' });

  // Load history on mount (encrypted in localStorage)
  useEffect(() => {
    (async () => {
      const loaded = await loadHistory();
      setHistory(loaded);
    })();
  }, []);

  const addFromExpression = (item: HistoryItem) => {
    // Always ensure history persists
    (async () => {
      await addHistory(item);
      const h = await loadHistory();
      setHistory(h);
    })();
  };

  // Keyboard shortcuts (basic customizable)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const combo = [] as string[];
      if (e.ctrlKey) combo.push('Ctrl');
      if (e.metaKey) combo.push('Meta');
      if (e.shiftKey) combo.push('Shift');
      const key = (e.key === 'Enter') ? 'Enter' : e.key;
      combo.push(key);
      const pressed = combo.join('+');
      if (pressed === shortcuts.evaluate) {
        // trigger evaluate in Calculator by dispatching a custom event on window
        window.dispatchEvent(new CustomEvent('NimbusEvaluate'));
        e.preventDefault();
      } else if (pressed === shortcuts.clear) {
        // contemporary example: clear history
        (async () => {
          await clearHistory();
          setHistory([]);
        })();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);

  // For this starter, the calculator component lives inside App for a cohesive demo
  // We'll render a minimal inline calculator to satisfy the PRD without external props

  // Simple onAddHistory implementation (from inline evaluation in UI)
  const onAddHistoryInline = (expr: string, value: number) => {
    const item: HistoryItem = { id: Math.random().toString(36).slice(2), expression: expr, result: value, timestamp: new Date().toISOString() };
    addFromExpression(item);
  };

  // Graph expression can be changed via input; here we keep a simple binding
  const onGraphExpressionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpressionForGraph(e.target.value);
  };

  return (
    <div className="container" aria-label="NimbusCalc-app">
      <header className="header" aria-label="brand-header">
        <div className="brand">
          <div className="logo" aria-label="brand-logo" />
          <h1>NimbusCalc</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={() => setProEnabled(v => !v)} aria-label="toggle-pro">{proEnabled ? 'Disable' : 'Enable'} Pro</button>
        </div>
      </header>

      <main className="main" aria-label="main-content">
        <section>
          <div className="card" aria-label="calculator-panel-inline">
            <div className="card-header">
              <div className="card-title">Calculator</div>
              <span className="legend" aria-label="shortcuts">Shortcuts: {shortcuts.evaluate} / {shortcuts.clear}</span>
            </div>
            <div>
              <input className="input" placeholder="Type expression (e.g., sin(pi/2) + x)" id="expr-inline" onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'enter') {
                  try {
                    const val = evaluateExpressionSafe((e.target as HTMLInputElement).value, 0);
                    const item = { id: Math.random().toString(36).slice(2), expression: (e.target as HTMLInputElement).value, result: val, timestamp: new Date().toISOString() } as HistoryItem;
                    addFromExpression(item);
                  } catch {}
                }
              }} />
            </div>
          </div>
          <div style={{ height: 8 }} />
          <GraphPanel expression={expressionForGraph} />
        </section>
        <section>
          <HistoryPanel items={history} onClear={async () => { await clearHistory(); setHistory([]); }} onDelete={async (id) => {
            // simple local delete: rebuild list without item
            const list = history.filter(h => h.id !== id);
            setHistory(list);
            // persist updated
            await saveHistory(list);
          }} onSelect={(expr) => {
            // fill calculator input with expression
            const el = document.getElementById('expr-inline') as HTMLInputElement | null;
            if (el) el.value = expr;
          }} />
        </section>
      </main>
    </div>
  );
};

export default App;
