import { Component, effect, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  PERFORMANCE_PRESETS,
  PerformancePreset,
  PerformancePresetConfig,
  UploadCommonValue,
} from '../../../../core/models/upload-config.model';

@Component({
  selector: 'app-performance-preset',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card-grid">
      @for (entry of presetEntries; track entry[0]) {
        <button
          type="button"
          class="card-option"
          [class.card-option--selected]="selected() === entry[0]"
          (click)="select(entry[0])"
        >
          <span class="card-option__icon">{{ icons[entry[0]] }}</span>
          <span class="card-option__label">{{ entry[1].label }}</span>
          <span class="card-option__sublabel">{{ entry[1].sublabel }}</span>
        </button>
      }
    </div>
  `,
})
export class PerformancePresetComponent {
  selected = input<PerformancePreset | null>(null);
  presetSelected = output<{ preset: PerformancePreset; config: PerformancePresetConfig }>();

  readonly presetEntries = Object.entries(PERFORMANCE_PRESETS) as [PerformancePreset, PerformancePresetConfig][];

  readonly icons: Record<PerformancePreset, string> = {
    'basic-home':       '🏠',
    'home-server':      '🖥️',
    'dedicated-server': '🗄️',
    'enterprise':       '🏢',
  };

  select(preset: PerformancePreset) {
    this.presetSelected.emit({ preset, config: PERFORMANCE_PRESETS[preset] });
  }
}
