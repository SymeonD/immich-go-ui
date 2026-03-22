import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-collapsible-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="collapsible">
      <button type="button" class="collapsible__header" (click)="toggle()">
        <span class="collapsible__toggle-icon" [class.collapsible__toggle-icon--open]="open()">▸</span>
        <span class="collapsible__label">{{ label }}</span>
        @if (advanced) {
          <span class="badge">Advanced</span>
        }
      </button>
      @if (open()) {
        <div class="collapsible__body">
          <ng-content />
        </div>
      }
    </div>
  `,
  styles: [`
    .collapsible {
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .collapsible__header {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: var(--color-surface);
      border: none;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      color: var(--color-text);
      text-align: left;
      transition: background .15s;

      &:hover { background: var(--color-bg); }
    }

    .collapsible__toggle-icon {
      display: inline-block;
      transition: transform .2s;
      font-size: 12px;
      color: var(--color-text-muted);

      &--open { transform: rotate(90deg); }
    }

    .collapsible__label { flex: 1; }

    .collapsible__body {
      padding: var(--card-padding);
      border-top: 1px solid var(--color-border);
    }
  `],
})
export class CollapsibleSectionComponent {
  @Input() label = '';
  @Input() advanced = false;
  @Input() initiallyOpen = false;

  open = signal(false);

  ngOnInit() {
    this.open.set(this.initiallyOpen);
  }

  toggle() {
    this.open.update(v => !v);
  }
}
