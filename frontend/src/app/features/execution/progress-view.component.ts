import {
  Component,
  effect,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExecutionService } from '../../core/services/execution.service';

@Component({
  selector: 'app-progress-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-view">
      <div class="progress-view__header">
        <div>
          <h2 class="progress-view__title">Running…</h2>
          <span class="progress-view__status">{{ exec.state() }}</span>
        </div>
        @if (exec.state() === 'running') {
          <button type="button" class="btn-stop" (click)="stop()">⏹ Stop</button>
        }
      </div>

      <div class="log-container" #logContainer (scroll)="onScroll()">
        @for (line of exec.logLines(); track $index) {
          <div class="log-line" [innerHTML]="line.html"></div>
        }
        @if (exec.logLines().length === 0) {
          <div class="log-line log-line--empty">Waiting for output…</div>
        }
      </div>

      @if (exec.errorMsg()) {
        <div class="error-banner">⚠ {{ exec.errorMsg() }}</div>
      }
    </div>
  `,
  styles: [`
    .progress-view {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: 16px;
    }

    .progress-view__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .progress-view__title {
      font-size: 20px;
      font-weight: 600;
    }

    .progress-view__status {
      font-size: 12px;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: .05em;
    }

    .btn-stop {
      padding: 8px 16px;
      background: var(--color-error);
      color: #fff;
      border: none;
      border-radius: var(--radius-sm);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: opacity .15s;

      &:hover { opacity: .9; }
    }

    .log-container {
      flex: 1;
      overflow-y: auto;
      background: var(--color-terminal-bg);
      border: 1px solid var(--color-terminal-border);
      border-radius: var(--radius-md);
      padding: 12px 14px;
      font-family: var(--font-mono);
      font-size: 12px;
      line-height: 1.6;
    }

    .log-line {
      color: #e2e8f0;
      white-space: pre-wrap;
      word-break: break-all;

      &--empty { color: rgba(255,255,255,.3); font-style: italic; }

      // ANSI colors passthrough via innerHTML
      :global(span[style]) { font-family: inherit; }
    }

    .error-banner {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radius-sm);
      padding: 10px 14px;
      color: var(--color-error);
      font-size: 13px;
    }
  `],
})
export class ProgressViewComponent {
  exec = inject(ExecutionService);

  @ViewChild('logContainer') logContainer!: ElementRef<HTMLDivElement>;

  private userScrolledUp = false;

  constructor() {
    // Auto-scroll to bottom when new lines arrive, unless user scrolled up
    effect(() => {
      const _ = this.exec.logLines(); // subscribe to signal
      if (!this.userScrolledUp) {
        setTimeout(() => {
          const el = this.logContainer?.nativeElement;
          if (el) el.scrollTop = el.scrollHeight;
        });
      }
    });
  }

  onScroll() {
    const el = this.logContainer?.nativeElement;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    this.userScrolledUp = !atBottom;
  }

  stop() {
    this.exec.cancel();
  }
}
