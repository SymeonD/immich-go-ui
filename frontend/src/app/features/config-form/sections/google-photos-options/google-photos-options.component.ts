import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { TagInputComponent } from '../../../shared/tag-input/tag-input.component';
import { CollapsibleSectionComponent } from '../../../shared/collapsible-section/collapsible-section.component';
import { PathInputComponent } from '../../../shared/path-input/path-input.component';
import { GooglePhotosFormGroup } from '../../../../core/models/upload-config.model';

@Component({
  selector: 'app-google-photos-options',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TagInputComponent, CollapsibleSectionComponent, PathInputComponent],
  template: `
    <div [formGroup]="form" class="section-stack">
      <!-- Source path -->
      <div class="section-card">
        <h3 class="section-title" style="font-size:14px;margin-bottom:12px;">Source</h3>
        <div class="form-row" style="border-bottom:none">
          <div class="form-label">Takeout Path<span class="form-label__required">*</span><span class="form-label__hint">Google Takeout export folder</span></div>
          <app-path-input formControlName="sourcePath" placeholder="/path/to/takeout" />
        </div>
      </div>

      <!-- Content inclusion -->
      <div class="section-card">
        <h3 class="section-title" style="font-size:14px;margin-bottom:12px;">Google Photos Options</h3>

        <div class="form-row">
          <div class="form-label">Include Archived<span class="form-label__hint">Import archived photos</span></div>
          <div class="checkbox-row"><input type="checkbox" id="includeArchived" formControlName="includeArchived"/><label for="includeArchived">Enable</label></div>
        </div>
        <div class="form-row">
          <div class="form-label">Include Trashed<span class="form-label__hint">Import photos in trash</span></div>
          <div class="checkbox-row"><input type="checkbox" id="includeTrashed" formControlName="includeTrashed"/><label for="includeTrashed">Enable</label></div>
        </div>
        <div class="form-row">
          <div class="form-label">Include Partner Photos<span class="form-label__hint">Import partner-shared photos</span></div>
          <div class="checkbox-row"><input type="checkbox" id="includePartner" formControlName="includePartner"/><label for="includePartner">Enable</label></div>
        </div>
        <div class="form-row">
          <div class="form-label">Include Unmatched<span class="form-label__hint">Import photos without matching JSON metadata</span></div>
          <div class="checkbox-row"><input type="checkbox" id="includeUnmatched" formControlName="includeUnmatched"/><label for="includeUnmatched">Enable</label></div>
        </div>
        <div class="form-row">
          <div class="form-label">Sync Albums<span class="form-label__hint">Auto-create albums from Google Photos</span></div>
          <div class="checkbox-row"><input type="checkbox" id="syncAlbums" formControlName="syncAlbums"/><label for="syncAlbums">Enable</label></div>
        </div>
        <div class="form-row">
          <div class="form-label">Include Untitled Albums<span class="form-label__hint">Import albums without titles</span></div>
          <div class="checkbox-row"><input type="checkbox" id="includeUntitledAlbums" formControlName="includeUntitledAlbums"/><label for="includeUntitledAlbums">Enable</label></div>
        </div>
        <div class="form-row">
          <div class="form-label">From Album<span class="form-label__hint">Restrict import to specific album only</span></div>
          <input class="form-control" formControlName="fromAlbumName" placeholder="Album name"/>
        </div>
        <div class="form-row">
          <div class="form-label">Partner Shared Album<span class="form-label__hint">Album name for partner's photos</span></div>
          <input class="form-control" formControlName="partnerSharedAlbum" placeholder="Partner Photos"/>
        </div>
        <div class="form-row">
          <div class="form-label">Takeout Tag<span class="form-label__hint">Tag uploads with takeout session ID</span></div>
          <div class="checkbox-row"><input type="checkbox" id="takeoutTag" formControlName="takeoutTag"/><label for="takeoutTag">Enable</label></div>
        </div>
        <div class="form-row">
          <div class="form-label">People Tags<span class="form-label__hint">Tag uploads with people names from metadata</span></div>
          <div class="checkbox-row"><input type="checkbox" id="peopleTag" formControlName="peopleTag"/><label for="peopleTag">Enable</label></div>
        </div>
        <div class="form-row" style="border-bottom:none">
          <div class="form-label">Excluded Patterns<span class="form-label__hint">File patterns to exclude</span></div>
          <app-tag-input formControlName="banFiles"/>
        </div>
      </div>
    </div>
  `,
  styles: [`.section-stack { display: flex; flex-direction: column; gap: 12px; }`],
})
export class GooglePhotosOptionsComponent {
  @Input({ required: true }) form!: FormGroup<GooglePhotosFormGroup>;
}
