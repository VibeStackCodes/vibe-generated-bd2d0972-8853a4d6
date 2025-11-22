import React from 'react';
import type { HistoryItem } from '@/types';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export interface HistoryPanelProps {
  items: HistoryItem[];
  onClear?: () => void;
  onDelete?: (id: string) => void;
  onSelect?: (expr: string) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ items, onClear, onDelete, onSelect }) => {
  return (
    <div className="card" aria-label="history-panel">
      <div className="card-header">
        <div className="card-title">History</div>
        <Button variant="secondary" onClick={onClear} ariaLabel="clear-history">Clear</Button>
      </div>
      <div className="history-list" role="list">
        {items.length === 0 && <div role="note">No history yet. Run some calculations to see results here.</div>}
        {items.map(item => (
          <div key={item.id} className="history-item" role="listitem">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontFamily: 'Monospace' }}>{item.expression}</span>
              <span style={{ color: '#555' }}>= {item.result}</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {onSelect && (
                <button className="btn ghost" onClick={() => onSelect(item.expression)} aria-label="use-expression">Use</button>
              )}
              {onDelete && (
                <button className="btn ghost" onClick={() => onDelete(item.id)} aria-label="delete">Delete</button>
              )}
              <span style={{ color: '#888', fontSize: 12 }}>{formatDate(new Date(item.timestamp))}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
