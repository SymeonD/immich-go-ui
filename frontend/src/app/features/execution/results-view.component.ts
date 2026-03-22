import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExecutionService } from '../../core/services/execution.service';

@Component({
  selector: 'app-results-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="results-view">
      <div class="results-view__badge" [class.results-view__badge--success]="exec.exitCode() === 0"
                                        [class.results-view__badge--error]="exec.exitCode() !== 0">
        {{ exec.exitCode() === 0 ? '✓ Completed successfully' : '✗ Completed with errors' }}
      </div>

      <div class="results-view__stats">
        <div class="stat">
          <div class="stat__label">Exit Code</div>
          <div class="stat__value" [class.stat__value--error]="exec.exitCode() !== 0">
            {{ exec.exitCode() }}
          </div>
        </div>
        <div class="stat">
          <div class="stat__label">Duration</div>
          <div class="stat__value">{{ exec.duration() ?? '—' }}</div>
        </div>
      </div>

      <details class="log-details">
        <summary>View full log ({{ exec.logLines().length }} lines)</summary>
        <div class="log-mini">
          @for (line of exec.logLines(); track $index) {
            <div class="log-mini__line" [innerHTML]="line.html"></div>
          }
        </div>
      </details>

      <button type="button" class="btn-primary" (click)="startOver.emit()">↩ Start Over</button>
    </div>
  `,
  styles: [`
    .results-view {
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 640px;
    }

    .results-view__badge {
      display: inline-flex;
      align-items: center;
      padding: 10px 20px;
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: 16px;

      &--success {
        background: #f0fdf4;
        color: var(--color-success);
        border: 1px solid #bbf7d0;
      }

      &--error {
        background: #fef2f2;
        color: var(--color-error);
        border: 1px solid #fecaca;
      }
    }

    .results-view__stats {
      display: flex;
      gap: 32px;
    }

    .stat__label {
      font-size: 12px;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: .05em;
      margin-bottom: 4px;
    }

    .stat__value {
      font-size: 28px;
      font-weight: 700;
      color: var(--color-text);

      &--error { color: var(--color-error); }
    }

    .log-details summary {
      cursor: pointer;
      font-size: 13px;
      color: var(--color-primary);
      user-select: none;
      padding: 4px 0;
    }

    .log-mini {
      margin-top: 12px;
      background: var(--color-terminal-bg);
      border-radius: var(--radius-md);
      padding: 12px 14px;
      max-height: 300px;
      overflow-y: auto;
      font-family: var(--font-mono);
      font-size: 11px;
      line-height: 1.6;
    }

    .log-mini__line {
      color: #e2e8f0;
      white-space: pre-wrap;
      word-break: break-all;
    }

    .btn-primary {
      padding: 10px 20px;
      background: var(--color-primary);
      color: #fff;
      border: none;
      border-radius: var(--radius-sm);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      align-self: flex-start;
      transition: background .15s;

      &:hover { background: var(--color-primary-hover); }
    }
  `],
})
export class ResultsViewComponent {
  exec = inject(ExecutionService);
  startOver = output<void>();
}
