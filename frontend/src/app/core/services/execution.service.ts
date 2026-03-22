import { Injectable, signal } from '@angular/core';
import AnsiToHtml from 'ansi-to-html';
import { DoneEvent, LogEvent, LogLine } from '../models/upload-config.model';

const converter = new AnsiToHtml({ escapeXML: true, newline: false });

@Injectable({ providedIn: 'root' })
export class ExecutionService {
  private eventSource: EventSource | null = null;

  readonly logLines    = signal<LogLine[]>([]);
  readonly state       = signal<'idle' | 'running' | 'done' | 'error'>('idle');
  readonly exitCode    = signal<number | null>(null);
  readonly duration    = signal<string | null>(null);
  readonly errorMsg    = signal<string | null>(null);

  async start(args: string[]): Promise<void> {
    this.logLines.set([]);
    this.exitCode.set(null);
    this.duration.set(null);
    this.errorMsg.set(null);

    // Step 1: prepare token
    let token: string;
    try {
      const res = await fetch('/api/execute/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ args }),
      });
      if (!res.ok) throw new Error(`Prepare failed: HTTP ${res.status}`);
      const data = await res.json();
      token = data.token;
    } catch (e: any) {
      this.errorMsg.set(e.message ?? 'Failed to start');
      this.state.set('error');
      return;
    }

    // Step 2: open SSE stream
    this.state.set('running');
    this.eventSource = new EventSource(`/api/execute/stream?token=${token}`);

    this.eventSource.addEventListener('log', (e: MessageEvent) => {
      const data: LogEvent = JSON.parse(e.data);
      const html = safeAnsiToHtml(data.line);
      this.logLines.update(lines => [...lines, { text: data.line, ts: data.ts, html }]);
    });

    this.eventSource.addEventListener('done', (e: MessageEvent) => {
      const data: DoneEvent = JSON.parse(e.data);
      this.exitCode.set(data.exitCode);
      this.duration.set(data.duration);
      this.state.set('done');
      this.eventSource?.close();
      this.eventSource = null;
    });

    this.eventSource.addEventListener('error', (e: MessageEvent) => {
      let msg = 'Execution error';
      try { msg = JSON.parse((e as any).data)?.message ?? msg; } catch {}
      this.errorMsg.set(msg);
      this.state.set('error');
      this.eventSource?.close();
      this.eventSource = null;
    });
  }

  cancel(): void {
    fetch('/api/execute/cancel', { method: 'POST' }).catch(() => {});
    this.eventSource?.close();
    this.eventSource = null;
    this.state.set('idle');
  }

  reset(): void {
    this.cancel();
    this.logLines.set([]);
    this.exitCode.set(null);
    this.duration.set(null);
    this.errorMsg.set(null);
    this.state.set('idle');
  }
}

function safeAnsiToHtml(raw: string): string {
  try {
    return converter.toHtml(raw);
  } catch {
    return raw.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
