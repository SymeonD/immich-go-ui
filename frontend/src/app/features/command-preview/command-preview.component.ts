import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-command-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="terminal">
      <div class="terminal__header">
        <span class="terminal__title">Generated Command</span>
        <button type="button" class="terminal__copy" (click)="copy()" title="Copy to clipboard">
          {{ copied ? '✓ Copied' : '⧉ Copy' }}
        </button>
      </div>
      <pre class="terminal__code"><span class="terminal__prompt">$ </span>{{ displayCommand() }}</pre>
    </div>
  `,
  styles: [`
    .terminal {
      background: var(--color-terminal-bg);
      border: 1px solid var(--color-terminal-border);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .terminal__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 14px;
      border-bottom: 1px solid var(--color-terminal-border);
    }

    .terminal__title {
      font-size: 12px;
      font-weight: 500;
      color: rgba(255,255,255,.5);
    }

    .terminal__copy {
      background: none;
      border: 1px solid rgba(255,255,255,.2);
      border-radius: var(--radius-sm);
      color: rgba(255,255,255,.6);
      font-size: 11px;
      padding: 3px 8px;
      cursor: pointer;
      transition: border-color .15s, color .15s;

      &:hover {
        border-color: rgba(255,255,255,.5);
        color: #fff;
      }
    }

    .terminal__code {
      padding: 14px;
      font-family: var(--font-mono);
      font-size: 13px;
      color: var(--color-terminal-text);
      white-space: pre-wrap;
      word-break: break-all;
      margin: 0;
    }

    .terminal__prompt {
      color: rgba(255,255,255,.3);
    }
  `],
})
export class CommandPreviewComponent {
  args = input<string[]>([]);

  copied = false;

  displayCommand(): string {
    const parts = ['immich-go', ...this.args()];
    return parts.map(p => (p.includes(' ') ? `"${p}"` : p)).join(' ');
  }

  copy() {
    navigator.clipboard.writeText(this.displayCommand()).then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 2000);
    });
  }
}
