import {
  Component,
  forwardRef,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-tag-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TagInputComponent),
    multi: true,
  }],
  template: `
    <div class="tag-input">
      <div class="tag-input__chips">
        @for (tag of tags(); track $index) {
          <span class="tag-chip">
            {{ tag }}
            <button type="button" class="tag-chip__remove" (click)="remove($index)" [disabled]="disabled()">×</button>
          </span>
        }
        <input
          class="tag-input__field"
          [(ngModel)]="inputValue"
          (keydown.enter)="add($event)"
          (keydown.comma)="add($event)"
          (blur)="addFromBlur()"
          [disabled]="disabled()"
          placeholder="{{ tags().length === 0 ? placeholder : '' }}"
        />
      </div>
    </div>
  `,
  styles: [`
    .tag-input {
      width: 100%;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background: var(--color-surface);
      padding: 4px 8px;
      display: flex;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 4px;
      min-height: 36px;
      cursor: text;

      &:focus-within {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(37,99,235,.1);
      }
    }

    .tag-input__chips {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px;
      width: 100%;
    }

    .tag-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: var(--color-primary-light);
      color: var(--color-primary);
      border: 1px solid var(--color-primary);
      border-radius: 100px;
      padding: 1px 8px;
      font-size: 12px;
      font-weight: 500;

      &__remove {
        border: none;
        background: none;
        cursor: pointer;
        color: var(--color-primary);
        font-size: 14px;
        padding: 0;
        line-height: 1;
        &:hover { color: var(--color-error); }
      }
    }

    .tag-input__field {
      border: none;
      outline: none;
      font-size: 14px;
      background: transparent;
      min-width: 80px;
      flex: 1;
      color: var(--color-text);
      padding: 2px 0;
    }
  `],
})
export class TagInputComponent implements ControlValueAccessor {
  placeholder = 'Type and press Enter…';

  tags = signal<string[]>([]);
  disabled = signal(false);
  inputValue = '';

  private onChange: (v: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string[] | null): void {
    this.tags.set(value ?? []);
  }

  registerOnChange(fn: (v: string[]) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled.set(isDisabled); }

  add(event: Event): void {
    event.preventDefault();
    const val = this.inputValue.trim().replace(/,$/, '');
    if (val && !this.tags().includes(val)) {
      this.tags.update(tags => [...tags, val]);
      this.onChange(this.tags());
    }
    this.inputValue = '';
  }

  addFromBlur(): void {
    const val = this.inputValue.trim().replace(/,$/, '');
    if (val && !this.tags().includes(val)) {
      this.tags.update(tags => [...tags, val]);
      this.onChange(this.tags());
      this.inputValue = '';
    }
    this.onTouched();
  }

  remove(index: number): void {
    this.tags.update(tags => tags.filter((_, i) => i !== index));
    this.onChange(this.tags());
  }
}
