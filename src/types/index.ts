export interface HistoryItem {
  id: string;
  expression: string;
  result: number;
  timestamp: string; // ISO string
}

export type ShortcutAction = 'evaluate' | 'clear';

export interface ShortcutConfig {
  action: ShortcutAction;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  key?: string; // e.g. 'Enter', 'L', 'E'
}

export interface GraphConfig {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export type AppStatus = 'idle' | 'loading' | 'ready' | 'error';
