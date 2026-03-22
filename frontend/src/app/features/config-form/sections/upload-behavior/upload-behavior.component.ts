import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CollapsibleSectionComponent } from '../../../shared/collapsible-section/collapsible-section.component';
import { TagInputComponent } from '../../../shared/tag-input/tag-input.component';
import { UploadCommonGroup } from '../../../../core/models/upload-config.model';

@Component({
  selector: 'app-upload-behavior',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CollapsibleSectionComponent, TagInputComponent],
  template: `
    <div [formGroup]="form" class="section-stack">
      <!-- Upload Behavior -->
      <div class="section-card">
        <h3 class="section-title" style="font-size:14px;margin-bottom:12px;">Upload Behavior</h3>
        <div class="form-row" style="border-bottom:none">
          <div class="form-label">Dry Run<span class="form-label__hint">Simulate upload without transfer</span></div>
          <div class="checkbox-row"><input type="checkbox" id="dryRun" formControlName="dryRun"/><label for="dryRun">Enable</label></div>
        </div>
      </div>

      <!-- Advanced Upload Behavior -->
      <app-collapsible-section label="Advanced Upload Behavior" [advanced]="true">
        <div class="form-row">
          <div class="form-label">Concurrent Tasks<span class="form-label__hint">Number of parallel upload tasks (1–20)</span></div>
          <input class="form-control" formControlName="concurrentTasks" type="number" min="1" max="20"/>
        </div>
        <div class="form-row">
          <div class="form-label">Overwrite<span class="form-label__hint">Replace existing files on server</span></div>
          <div class="checkbox-row"><input type="checkbox" id="overwrite" formControlName="overwrite"/><label for="overwrite">Enable</label></div>
        </div>
        <div class="form-row">
          <div class="form-label">Pause Immich Jobs<span class="form-label__hint">Pause server jobs during upload</span></div>
          <div class="checkbox-row"><input type="checkbox" id="pauseImmichJobs" formControlName="pauseImmichJobs"/><label for="pauseImmichJobs">Enable</label></div>
        </div>
        <div class="form-row" style="border-bottom:none">
          <div class="form-label">On Errors<span class="form-label__hint">Error handling behavior</span></div>
          <select class="form-control" formControlName="onErrors">
            <option value="stop">Stop on error</option>
            <option value="continue">Continue on error</option>
          </select>
        </div>
      </app-collapsible-section>

      <!-- Tagging & Organization -->
      <app-collapsible-section label="Tagging &amp; Organization" [advanced]="true">
        <div class="form-row">
          <div class="form-label">Session Tag<span class="form-label__hint">Tag with upload session timestamp</span></div>
          <div class="checkbox-row"><input type="checkbox" id="sessionTag" formControlName="sessionTag"/><label for="sessionTag">Enable</label></div>
        </div>
        <div class="form-row">
          <div class="form-label">Custom Tags<span class="form-label__hint">Add custom tags (press Enter after each)</span></div>
          <app-tag-input formControlName="customTags"/>
        </div>
        <div class="form-row" style="border-bottom:none">
          <div class="form-label">Device UUID<span class="form-label__hint">Set device identifier</span></div>
          <input class="form-control" formControlName="deviceUuid" placeholder="$LOCALHOST"/>
        </div>
      </app-collapsible-section>

      <!-- User Interface -->
      <app-collapsible-section label="User Interface" [advanced]="true">
        <div class="form-row">
          <div class="form-label">No UI<span class="form-label__hint">Disable interactive UI during upload</span></div>
          <div class="checkbox-row"><input type="checkbox" id="noUi" formControlName="noUi"/><label for="noUi">Enable</label></div>
        </div>
        <div class="form-row" style="border-bottom:none">
          <div class="form-label">API Trace<span class="form-label__hint">Enable API call tracing (debugging)</span></div>
          <div class="checkbox-row"><input type="checkbox" id="apiTrace" formControlName="apiTrace"/><label for="apiTrace">Enable</label></div>
        </div>
      </app-collapsible-section>
    </div>
  `,
  styles: [`.section-stack { display: flex; flex-direction: column; gap: 12px; }`],
})
export class UploadBehaviorComponent {
  @Input({ required: true }) form!: FormGroup<UploadCommonGroup>;
}
