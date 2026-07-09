export type ToolId = 
  | 'dashboard'
  | 'audio'
  | 'video'
  | 'audio-extractor'
  | 'image'
  | 'text'
  | 'pdf'
  | 'unit'
  | 'speech'
  | 'history';

export interface ConversionItem {
  id: string;
  tool: ToolId;
  toolName: string;
  fileName: string;
  fileSize: number;
  fromFormat: string;
  toFormat: string;
  status: 'success' | 'processing' | 'error';
  timestamp: string;
  downloadUrl?: string;
  resultSize?: number;
}

export interface UnitCategory {
  name: string;
  units: { name: string; symbol: string; ratio: number }[];
}
