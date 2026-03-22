import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { UploadConfigStore } from '../../core/services/upload-config.store';
import { ExecutionService } from '../../core/services/execution.service';
import { CommandBuilderService } from '../../core/services/command-builder.service';
import { PerformancePreset, PerformancePresetConfig } from '../../core/models/upload-config.model';

import { SourceSelectorComponent } from './sections/source-selector/source-selector.component';
import { PerformancePresetComponent } from './sections/performance-preset/performance-preset.component';
import { ServerConnectionComponent } from './sections/server-connection/server-connection.component';
import { FolderOptionsComponent } from './sections/folder-options/folder-options.component';
import { GooglePhotosOptionsComponent } from './sections/google-photos-options/google-photos-options.component';
import { ICloudOptionsComponent } from './sections/icloud-options/icloud-options.component';
import { ImmichSourceOptionsComponent } from './sections/immich-source-options/immich-source-options.component';
import { UploadBehaviorComponent } from './sections/upload-behavior/upload-behavior.component';
import { CommandPreviewComponent } from '../command-preview/command-preview.component';

@Component({
  selector: 'app-config-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SourceSelectorComponent,
    PerformancePresetComponent,
    ServerConnectionComponent,
    FolderOptionsComponent,
    GooglePhotosOptionsComponent,
    ICloudOptionsComponent,
    ImmichSourceOptionsComponent,
    UploadBehaviorComponent,
    CommandPreviewComponent,
  ],
  template: `
    <div class="config-page">
      <header class="config-page__header">
        <h1>Immich Upload Configuration</h1>
        <p class="config-page__subtitle">Configure and execute immich-go upload commands with an intuitive interface</p>
      </header>

      <form (ngSubmit)="onExecute()">

        <!-- Upload Source -->
        <section class="config-section">
          <h2 class="section-title">Upload Source</h2>
          <app-source-selector
            [selected]="store.selectedSource()"
            (selectedChange)="onSourceChange($event)"
          />
        </section>

        <!-- Server Performance Preset -->
        <section class="config-section">
          <h2 class="section-title">Server Performance Preset</h2>
          <p class="section-subtitle">Choose a preset that matches your infrastructure to automatically configure optimal performance settings</p>
          <app-performance-preset
            [selected]="store.performancePreset()"
            (presetSelected)="onPresetSelected($event)"
          />
        </section>

        <!-- Configuration form -->
        <section class="config-section">
          <h2 class="section-title">Configuration</h2>
          <div class="form-sections">

            <!-- Server connection — always visible -->
            <app-server-connection [form]="store.serverForm" />

            <!-- Source-specific sections -->
            @if (store.selectedSource() === 'from-folder' || store.selectedSource() === 'from-picasa') {
              <app-folder-options [form]="store.folderForm" />
            }
            @if (store.selectedSource() === 'from-google-photos') {
              <app-google-photos-options [form]="store.googlePhotosForm" />
            }
            @if (store.selectedSource() === 'from-icloud') {
              <app-icloud-options [form]="store.icloudForm" />
            }
            @if (store.selectedSource() === 'from-immich') {
              <app-immich-source-options [form]="store.fromImmichForm" />
            }

            <!-- Upload behavior — always visible -->
            <app-upload-behavior [form]="store.uploadCommonForm" />

          </div>
        </section>

        <!-- Generated Command -->
        <section class="config-section">
          <app-command-preview [args]="store.generatedCommand()" />
        </section>

        <!-- Execute -->
        <section class="config-section config-section--execute">
          <button
            type="submit"
            class="btn-execute"
            [disabled]="!store.isValid()"
          >
            ▶ Execute Command
          </button>
          @if (!store.isValid()) {
            <span class="validation-warning">
              ⚠ Please fill in all required fields (Server URL, API Key, Source Path)
            </span>
          }
        </section>

      </form>
    </div>
  `,
  styles: [`
    .config-page {
      max-width: 1000px;
      margin: 0 auto;
      padding: 32px 24px;
    }

    .config-page__header {
      margin-bottom: 32px;

      h1 {
        font-size: 24px;
        font-weight: 700;
        color: var(--color-text);
        margin-bottom: 6px;
      }
    }

    .config-page__subtitle {
      color: var(--color-text-muted);
      font-size: 14px;
    }

    .config-section {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--card-padding);
      margin-bottom: var(--section-gap);

      &--execute {
        display: flex;
        align-items: center;
        gap: 16px;
      }
    }

    .section-subtitle {
      font-size: 13px;
      color: var(--color-text-muted);
      margin-bottom: 16px;
    }

    .form-sections {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 4px;
    }

    .btn-execute {
      padding: 10px 24px;
      background: var(--color-primary);
      color: #fff;
      border: none;
      border-radius: var(--radius-sm);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background .15s;

      &:hover:not(:disabled) { background: var(--color-primary-hover); }
      &:disabled {
        background: var(--color-border);
        color: var(--color-text-muted);
        cursor: not-allowed;
      }
    }

    .validation-warning {
      color: var(--color-warning);
      font-size: 13px;
    }
  `],
})
export class ConfigFormComponent {
  store = inject(UploadConfigStore);
  execution = inject(ExecutionService);
  commandBuilder = inject(CommandBuilderService);

  executed = output<void>();

  onSourceChange(source: any) {
    this.store.selectedSource.set(source);
  }

  onPresetSelected(event: { preset: PerformancePreset; config: PerformancePresetConfig }) {
    this.store.performancePreset.set(event.preset);
    this.store.uploadCommonForm.patchValue({
      concurrentTasks: event.config.concurrentTasks,
      onErrors: event.config.onErrors,
    });
  }

  async onExecute() {
    if (!this.store.isValid()) return;
    const args = this.store.generatedCommand();
    await this.execution.start(args);
    this.executed.emit();
  }
}
