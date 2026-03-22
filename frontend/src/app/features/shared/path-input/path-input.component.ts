import { Component, forwardRef, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-path-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => PathInputComponent),
    multi: true,
  }],
  template: `
    <div class="path-input" [class.path-input--disabled]="isDisabled">
      <input
        class="path-input__field form-control"
        [(ngModel)]="value"
        (ngModelChange)="onValueChange($event)"
        [placeholder]="placeholder"
        [disabled]="isDisabled"
        type="text"
      />
      <button
        type="button"
        class="path-input__btn"
        [disabled]="isDisabled || browsing()"
        (click)="browse()"
        title="Browse for ZIP file(s)"
      >
        @if (browsing()) { ⏳ } @else { 🗜️ }
      </button>
    </div>
  `,
  styles: [`
    .path-input {
      display: flex;
      align-items: stretch;
      width: 100%;

      &--disabled { opacity: .6; }
    }

    .path-input__field {
      flex: 1;
      border-radius: var(--radius-sm) 0 0 var(--radius-sm) !important;
      border-right: none !important;
      min-width: 0;
    }

    .path-input__btn {
      padding: 0 11px;
      border: 1px solid var(--color-border);
      border-left: none;
      border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
      background: var(--color-bg);
      cursor: pointer;
      font-size: 15px;
      transition: background .15s;
      white-space: nowrap;
      flex-shrink: 0;

      &:hover:not(:disabled) { background: var(--color-border); }
      &:disabled { cursor: not-allowed; opacity: .5; }
    }
  `],
})
export class PathInputComponent implements ControlValueAccessor {
  @Input() placeholder = '/path/to/folder';

  value = '';
  browsing = signal(false);
  isDisabled = false;

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(v: string | null): void { this.value = v ?? ''; }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.isDisabled = d; }

  onValueChange(v: string) {
    this.onChange(v);
    this.onTouched();
  }

  async browse() {
    this.browsing.set(true);
    try {
      const params = new URLSearchParams({ type: 'file' });
      if (this.value) params.set('start', this.value);
      const res = await fetch(`/api/browse?${params}`);
      const data: { paths: string[] } = await res.json();
      if (data.paths?.length) {
        const joined = data.paths.join(' ');
        this.value = joined;
        this.onChange(joined);
        this.onTouched();
      }
    } catch {
      // cancelled or backend unavailable
    } finally {
      this.browsing.set(false);
    }
  }
}
