import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { CollapsibleSectionComponent } from '../../../shared/collapsible-section/collapsible-section.component';
import { ServerConnectionGroup } from '../../../../core/models/upload-config.model';

@Component({
  selector: 'app-server-connection',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CollapsibleSectionComponent],
  template: `
    <div [formGroup]="form" class="section-stack">
      <!-- Destination Server Connection -->
      <div class="section-card">
        <h3 class="section-title" style="font-size:14px;margin-bottom:12px;">Destination Server Connection</h3>

        <div class="form-row">
          <div class="form-label">
            Server URL<span class="form-label__required">*</span>
            <span class="form-label__hint">Immich server URL</span>
          </div>
          <input class="form-control" formControlName="serverUrl"
                 placeholder="https://immich.example.com" type="url"
                 (blur)="prependHttps()" />
        </div>

        <div class="form-row">
          <div class="form-label">
            API Key<span class="form-label__required">*</span>
            <span class="form-label__hint">Server API key</span>
          </div>
          <input class="form-control" formControlName="apiKey"
                 placeholder="your-api-key-here" type="password" />
        </div>
      </div>

      <!-- Advanced Server Options -->
      <app-collapsible-section label="Advanced Server Options" [advanced]="true">
        <div class="form-row">
          <div class="form-label">
            Client Timeout
            <span class="form-label__hint">Server call timeout</span>
          </div>
          <input class="form-control" formControlName="clientTimeout" placeholder="20m" />
        </div>
        <div class="form-row" style="border-bottom:none">
          <div class="form-label">
            Skip SSL Verification
            <span class="form-label__hint">Skip SSL certificate verification</span>
          </div>
          <div class="checkbox-row">
            <input type="checkbox" id="skipSsl" formControlName="skipSsl" />
            <label for="skipSsl">Enable</label>
          </div>
        </div>
      </app-collapsible-section>
    </div>
  `,
  styles: [`.section-stack { display: flex; flex-direction: column; gap: 12px; }`],
})
export class ServerConnectionComponent {
  @Input({ required: true }) form!: FormGroup<ServerConnectionGroup>;

  prependHttps() {
    const ctrl = this.form.get('serverUrl');
    const v = (ctrl?.value ?? '').trim();
    if (v && !v.startsWith('http://') && !v.startsWith('https://')) {
      ctrl?.setValue('https://' + v);
    }
  }
}
