import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadSource } from '../../../../core/models/upload-config.model';

interface SourceOption {
  value: UploadSource;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-source-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card-grid">
      @for (opt of options; track opt.value) {
        <button
          type="button"
          class="card-option"
          [class.card-option--selected]="selected() === opt.value"
          (click)="select(opt.value)"
        >
          <span class="card-option__icon">{{ opt.icon }}</span>
          <span class="card-option__label">{{ opt.label }}</span>
        </button>
      }
    </div>
  `,
})
export class SourceSelectorComponent {
  selected = input.required<UploadSource>();
  selectedChange = output<UploadSource>();

  readonly options: SourceOption[] = [
    { value: 'from-folder',        label: 'From Folder',        icon: '📁' },
    { value: 'from-google-photos', label: 'From Google Photos', icon: '☁️' },
    { value: 'from-icloud',        label: 'From iCloud',        icon: '🌤️' },
    { value: 'from-picasa',        label: 'From Picasa',        icon: '🖼️' },
    { value: 'from-immich',        label: 'From Immich',        icon: '🖥️' },
  ];

  select(value: UploadSource) {
    this.selectedChange.emit(value);
  }
}
