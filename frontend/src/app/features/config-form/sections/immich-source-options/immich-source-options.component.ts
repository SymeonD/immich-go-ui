import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CollapsibleSectionComponent } from '../../../shared/collapsible-section/collapsible-section.component';
import { TagInputComponent } from '../../../shared/tag-input/tag-input.component';
import { FromImmichFormGroup } from '../../../../core/models/upload-config.model';

@Component({
  selector: 'app-immich-source-options',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CollapsibleSectionComponent, TagInputComponent],
  template: `
    <div [formGroup]="form" class="section-stack">
      <!-- Source server -->
      <div class="section-card">
        <h3 class="section-title" style="font-size:14px;margin-bottom:12px;">Source Immich Server</h3>
        <div class="form-row">
          <div class="form-label">Source Server URL<span class="form-label__required">*</span><span class="form-label__hint">URL of the source Immich instance</span></div>
          <input class="form-control" formControlName="fromServer" placeholder="https://source.immich.example.com"/>
        </div>
        <div class="form-row">
          <div class="form-label">Source API Key<span class="form-label__required">*</span><span class="form-label__hint">API key for source server</span></div>
          <input class="form-control" formControlName="fromApiKey" placeholder="source-api-key" type="password"/>
        </div>
        <div class="form-row">
          <div class="form-label">Skip SSL Verification<span class="form-label__hint">For source server</span></div>
          <div class="checkbox-row"><input type="checkbox" id="fromSkipSsl" formControlName="fromSkipSsl"/><label for="fromSkipSsl">Enable</label></div>
        </div>
        <div class="form-row" style="border-bottom:none">
          <div class="form-label">Client Timeout<span class="form-label__hint">Source server call timeout</span></div>
          <input class="form-control" formControlName="fromClientTimeout" placeholder="20m"/>
        </div>
      </div>

      <!-- Status filters -->
      <div class="section-card">
        <h3 class="section-title" style="font-size:14px;margin-bottom:12px;">Content Filters</h3>
        <div class="form-row">
          <div class="form-label">Favorites only</div>
          <div class="checkbox-row"><input type="checkbox" id="fromFavorite" formControlName="fromFavorite"/><label for="fromFavorite">Enable</label></div>
        </div>
        <div class="form-row">
          <div class="form-label">Archived only</div>
          <div class="checkbox-row"><input type="checkbox" id="fromArchived" formControlName="fromArchived"/><label for="fromArchived">Enable</label></div>
        </div>
        <div class="form-row">
          <div class="form-label">Trashed only</div>
          <div class="checkbox-row"><input type="checkbox" id="fromTrash" formControlName="fromTrash"/><label for="fromTrash">Enable</label></div>
        </div>
        <div class="form-row">
          <div class="form-label">Not in album</div>
          <div class="checkbox-row"><input type="checkbox" id="fromNoAlbum" formControlName="fromNoAlbum"/><label for="fromNoAlbum">Enable</label></div>
        </div>
        <div class="form-row">
          <div class="form-label">Include Partners<span class="form-label__hint">Include partner-shared assets</span></div>
          <div class="checkbox-row"><input type="checkbox" id="fromPartners" formControlName="fromPartners"/><label for="fromPartners">Enable</label></div>
        </div>
        <div class="form-row">
          <div class="form-label">Date Range<span class="form-label__hint">Filter by date range</span></div>
          <input class="form-control" formControlName="fromDateRange" placeholder="YYYY-MM-DD:YYYY-MM-DD"/>
        </div>
        <div class="form-row">
          <div class="form-label">Minimum Rating<span class="form-label__hint">0 = no filter, 1–5</span></div>
          <input class="form-control" formControlName="fromMinimalRating" type="number" min="0" max="5"/>
        </div>
        <div class="form-row">
          <div class="form-label">Albums<span class="form-label__hint">Filter by album names</span></div>
          <app-tag-input formControlName="fromAlbums"/>
        </div>
        <div class="form-row">
          <div class="form-label">Tags<span class="form-label__hint">Filter by tags</span></div>
          <app-tag-input formControlName="fromTags"/>
        </div>
        <div class="form-row" style="border-bottom:none">
          <div class="form-label">People<span class="form-label__hint">Filter by people names</span></div>
          <app-tag-input formControlName="fromPeople"/>
        </div>
      </div>

      <!-- Camera / location filters (Advanced) -->
      <app-collapsible-section label="Camera &amp; Location Filters" [advanced]="true">
        <div class="form-row">
          <div class="form-label">Camera Make</div>
          <input class="form-control" formControlName="fromMake" placeholder="Canon"/>
        </div>
        <div class="form-row">
          <div class="form-label">Camera Model</div>
          <input class="form-control" formControlName="fromModel" placeholder="EOS R5"/>
        </div>
        <div class="form-row">
          <div class="form-label">Country</div>
          <input class="form-control" formControlName="fromCountry" placeholder="France"/>
        </div>
        <div class="form-row">
          <div class="form-label">State / Province</div>
          <input class="form-control" formControlName="fromState" placeholder="Île-de-France"/>
        </div>
        <div class="form-row" style="border-bottom:none">
          <div class="form-label">City</div>
          <input class="form-control" formControlName="fromCity" placeholder="Paris"/>
        </div>
      </app-collapsible-section>
    </div>
  `,
  styles: [`.section-stack { display: flex; flex-direction: column; gap: 12px; }`],
})
export class ImmichSourceOptionsComponent {
  @Input({ required: true }) form!: FormGroup<FromImmichFormGroup>;
}
