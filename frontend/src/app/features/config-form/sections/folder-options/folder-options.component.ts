import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CollapsibleSectionComponent } from '../../../shared/collapsible-section/collapsible-section.component';
import { TagInputComponent } from '../../../shared/tag-input/tag-input.component';
import { PathInputComponent } from '../../../shared/path-input/path-input.component';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FolderFormGroup } from '../../../../core/models/upload-config.model';

@Component({
  selector: 'app-folder-options',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CollapsibleSectionComponent, TagInputComponent, PathInputComponent],
  template: `
    <div [formGroup]="form" class="section-stack">
      <!-- Source path -->
      <div class="section-card">
        <h3 class="section-title" style="font-size:14px;margin-bottom:12px;">Source</h3>
        <div class="form-row" style="border-bottom:none">
          <div class="form-label">
            Source Path<span class="form-label__required">*</span>
            <span class="form-label__hint">Local folder or ZIP file path</span>
          </div>
          <app-path-input formControlName="sourcePath" placeholder="/path/to/photos" />
        </div>
      </div>

      <!-- Folder options -->
      <div class="section-card">
        <h3 class="section-title" style="font-size:14px;margin-bottom:12px;">Folder Options</h3>

        <div class="form-row">
          <div class="form-label">Recursive<span class="form-label__hint">Process subfolders</span></div>
          <div class="checkbox-row"><input type="checkbox" id="recursive" formControlName="recursive"/><label for="recursive">Enable</label></div>
        </div>
        <div class="form-row">
          <div class="form-label">Date from Name<span class="form-label__hint">Extract date from filename if no metadata</span></div>
          <div class="checkbox-row"><input type="checkbox" id="dateFromName" formControlName="dateFromName"/><label for="dateFromName">Enable</label></div>
        </div>
        <div class="form-row" style="border-bottom:none">
          <div class="form-label">Ignore Sidecar Files<span class="form-label__hint">Skip XMP sidecar files</span></div>
          <div class="checkbox-row"><input type="checkbox" id="ignoreSidecarFiles" formControlName="ignoreSidecarFiles"/><label for="ignoreSidecarFiles">Enable</label></div>
        </div>
      </div>

      <!-- File filtering (Advanced) -->
      <app-collapsible-section label="File Filtering" [advanced]="true">
        <div class="form-row">
          <div class="form-label">Include Extensions<span class="form-label__hint">Comma-separated extensions to include (leave empty for all)</span></div>
          <input class="form-control" formControlName="includeExtensions" placeholder="jpg,png,mp4"/>
        </div>
        <div class="form-row">
          <div class="form-label">Exclude Extensions<span class="form-label__hint">Comma-separated extensions to exclude</span></div>
          <input class="form-control" formControlName="excludeExtensions" placeholder="gif,bmp"/>
        </div>
        <div class="form-row">
          <div class="form-label">Include Type<span class="form-label__hint">Type of files to include</span></div>
          <select class="form-control" formControlName="includeType">
            <option value="all">All (Images &amp; Videos)</option>
            <option value="IMAGE">Images only</option>
            <option value="VIDEO">Videos only</option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-label">Date Range<span class="form-label__hint">Date range filter (e.g., 2024-01-01:2024-12-31)</span></div>
          <input class="form-control" formControlName="dateRange" placeholder="YYYY-MM-DD:YYYY-MM-DD"/>
        </div>
        <div class="form-row" style="border-bottom:none">
          <div class="form-label">Excluded File Patterns<span class="form-label__hint">File patterns to exclude (--ban-file)</span></div>
          <app-tag-input formControlName="banFiles"/>
        </div>
      </app-collapsible-section>

      <!-- Album Management -->
      <div class="section-card">
        <h3 class="section-title" style="font-size:14px;margin-bottom:12px;">Album Management</h3>
        <div class="form-row">
          <div class="form-label">Folder as Album<span class="form-label__hint">Create albums from folders</span></div>
          <select class="form-control" formControlName="folderAsAlbum">
            <option value="NONE">None</option>
            <option value="FOLDER">Folder name</option>
            <option value="PATH">Full path</option>
          </select>
        </div>
        <div class="form-row" style="border-bottom:none">
          <div class="form-label">Into Album<span class="form-label__hint">Put all photos into specified album</span></div>
          <input class="form-control" formControlName="intoAlbum" placeholder="Album name"/>
        </div>
      </div>

      <!-- Advanced Album Options -->
      <app-collapsible-section label="Advanced Album Options" [advanced]="true">
        <div class="form-row">
          <div class="form-label">Folder as Tags<span class="form-label__hint">Use folder structure as tags</span></div>
          <div class="checkbox-row"><input type="checkbox" id="folderAsTags" formControlName="folderAsTags"/><label for="folderAsTags">Enable</label></div>
        </div>
        <div class="form-row">
          <div class="form-label">Album Path Joiner<span class="form-label__hint">Joiner string for album titles</span></div>
          <input class="form-control" formControlName="albumPathJoiner" placeholder=" / "/>
        </div>
        <div class="form-row" style="border-bottom:none">
          <div class="form-label">Album from Picasa<span class="form-label__hint">Use Picasa album names from .picasa.ini</span></div>
          <div class="checkbox-row"><input type="checkbox" id="albumPicasa" formControlName="albumPicasa"/><label for="albumPicasa">Enable</label></div>
        </div>
      </app-collapsible-section>

      <!-- File Management (Advanced) -->
      <app-collapsible-section label="File Management" [advanced]="true">
        <div class="form-row">
          <div class="form-label">Manage Burst Photos<span class="form-label__hint">How to handle burst photos</span></div>
          <select class="form-control" formControlName="manageBurst">
            <option value="NoStack">No Stack</option>
            <option value="Stack">Stack</option>
            <option value="StackKeepRaw">Stack (keep RAW as cover)</option>
            <option value="StackKeepJPEG">Stack (keep JPEG as cover)</option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-label">Manage RAW+JPEG<span class="form-label__hint">How to handle RAW+JPEG pairs</span></div>
          <select class="form-control" formControlName="manageRawJpeg">
            <option value="NoStack">No Stack</option>
            <option value="KeepRaw">Keep RAW</option>
            <option value="KeepJPG">Keep JPEG</option>
            <option value="StackCoverRaw">Stack (cover = RAW)</option>
            <option value="StackCoverJPG">Stack (cover = JPEG)</option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-label">Manage HEIC+JPEG<span class="form-label__hint">How to handle HEIC+JPEG pairs</span></div>
          <select class="form-control" formControlName="manageHeicJpeg">
            <option value="NoStack">No Stack</option>
            <option value="KeepHeic">Keep HEIC</option>
            <option value="KeepJPG">Keep JPEG</option>
            <option value="StackCoverHeic">Stack (cover = HEIC)</option>
            <option value="StackCoverJPG">Stack (cover = JPEG)</option>
          </select>
        </div>
        <div class="form-row" style="border-bottom:none">
          <div class="form-label">Epson FastFoto<span class="form-label__hint">Handle Epson FastFoto scanned photos</span></div>
          <div class="checkbox-row"><input type="checkbox" id="epsonFastFoto" formControlName="epsonFastFoto"/><label for="epsonFastFoto">Enable</label></div>
        </div>
      </app-collapsible-section>
    </div>
  `,
  styles: [`.section-stack { display: flex; flex-direction: column; gap: 12px; }`],
})
export class FolderOptionsComponent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input({ required: true }) form!: FormGroup<any>;
}
