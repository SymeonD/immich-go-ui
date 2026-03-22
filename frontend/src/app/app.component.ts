import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppView, BinaryStatus } from './core/models/upload-config.model';
import { ExecutionService } from './core/services/execution.service';
import { ConfigFormComponent } from './features/config-form/config-form.component';
import { ProgressViewComponent } from './features/execution/progress-view.component';
import { ResultsViewComponent } from './features/execution/results-view.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ConfigFormComponent,
    ProgressViewComponent,
    ResultsViewComponent,
  ],
  template: `
    <!-- Binary status banner -->
    @if (binaryStatus()?.status === 'downloading') {
      <div class="status-banner status-banner--info">
        ⏳ Downloading immich-go binary… {{ binaryStatus()?.message }}
      </div>
    }
    @if (binaryStatus()?.status === 'error') {
      <div class="status-banner status-banner--error">
        ✗ {{ binaryStatus()?.message }}
      </div>
    }

    <main class="app-main">
      @switch (view()) {
        @case ('config') {
          <app-config-form (executed)="onExecuted()" />
        }
        @case ('progress') {
          <div class="execution-shell">
            @if (execution.state() === 'done') {
              <div class="auto-advance">Command finished — <a href="#" (click)="goToResults($event)">view results</a></div>
            }
            <app-progress-view />
          </div>
        }
        @case ('results') {
          <div class="execution-shell">
            <app-results-view (startOver)="startOver()" />
          </div>
        }
      }
    </main>

    <!-- Floating help button -->
    <a class="help-btn" href="https://github.com/simulot/immich-go" target="_blank" title="immich-go documentation">?</a>
  `,
  styles: [`
    .status-banner {
      padding: 10px 24px;
      font-size: 13px;
      font-weight: 500;

      &--info    { background: #eff6ff; color: var(--color-primary); border-bottom: 1px solid #bfdbfe; }
      &--error   { background: #fef2f2; color: var(--color-error);   border-bottom: 1px solid #fecaca; }
    }

    .app-main {
      min-height: 100vh;
    }

    .execution-shell {
      max-width: 1000px;
      margin: 0 auto;
      padding: 32px 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-height: calc(100vh - 60px);
    }

    .auto-advance {
      font-size: 13px;
      color: var(--color-text-muted);
      a { color: var(--color-primary); }
    }

    .help-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--color-text-muted);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: 700;
      text-decoration: none;
      box-shadow: var(--shadow-sm);
      transition: background .15s;

      &:hover { background: var(--color-text); }
    }
  `],
})
export class AppComponent implements OnInit {
  execution = inject(ExecutionService);

  view = signal<AppView>('config');
  binaryStatus = signal<BinaryStatus | null>(null);

  ngOnInit() {
    this.pollBinaryStatus();
  }

  private async pollBinaryStatus() {
    const poll = async () => {
      try {
        const res = await fetch('/api/status');
        const data: BinaryStatus = await res.json();
        this.binaryStatus.set(data);
        if (data.status === 'downloading') {
          setTimeout(poll, 1500);
        }
      } catch {
        // backend not reachable yet — retry
        setTimeout(poll, 2000);
      }
    };
    poll();
  }

  onExecuted() {
    this.view.set('progress');
  }

  goToResults(e: Event) {
    e.preventDefault();
    this.view.set('results');
  }

  startOver() {
    this.execution.reset();
    this.view.set('config');
  }
}
