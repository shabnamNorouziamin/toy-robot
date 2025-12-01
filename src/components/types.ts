export interface LogEntry {
  id: number;
  raw: string;
  parsed: boolean;
  error?: string;
  reportOutput?: string | null;
  note?: string;
}
