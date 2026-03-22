import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { FolderOptionsComponent } from '../folder-options/folder-options.component';
import { ICloudFormGroup } from '../../../../core/models/upload-config.model';

@Component({
  selector: 'app-icloud-options',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FolderOptionsComponent],
  template: `
    <div [formGroup]="form" class="section-stack">
      <app-folder-options [form]="form" />

      <div class="section-card">
        <h3 class="section-title" style="font-size:14px;margin-bottom:12px;">iCloud Options</h3>
        <div class="form-row" style="border-bottom:none">
          <div class="form-label">Import Memories<span class="form-label__hint">Import iCloud Memories as albums</span></div>
          <div class="checkbox-row"><input type="checkbox" id="memories" formControlName="memories"/><label for="memories">Enable</label></div>
        </div>
      </div>
    </div>
  `,
  styles: [`.section-stack { display: flex; flex-direction: column; gap: 12px; }`],
})
export class ICloudOptionsComponent {
  @Input({ required: true }) form!: FormGroup<ICloudFormGroup>;
}
