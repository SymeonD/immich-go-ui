import { Injectable, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  FolderFormGroup,
  FromImmichFormGroup,
  GooglePhotosFormGroup,
  ICloudFormGroup,
  PerformancePreset,
  ServerConnectionGroup,
  UploadCommonGroup,
  UploadSource,
} from '../models/upload-config.model';
import { CommandBuilderService } from './command-builder.service';

@Injectable({ providedIn: 'root' })
export class UploadConfigStore {
  // ── View signals ────────────────────────────────────────────────────────────
  readonly selectedSource = signal<UploadSource>('from-folder');
  readonly performancePreset = signal<PerformancePreset | null>('home-server');

  // ── Forms ───────────────────────────────────────────────────────────────────
  readonly serverForm = new FormGroup<ServerConnectionGroup>({
    serverUrl:     new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    apiKey:        new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    skipSsl:       new FormControl(false, { nonNullable: true }),
    clientTimeout: new FormControl('20m', { nonNullable: true }),
  });

  readonly uploadCommonForm = new FormGroup<UploadCommonGroup>({
    concurrentTasks: new FormControl(4,          { nonNullable: true }),
    onErrors:        new FormControl('continue', { nonNullable: true }),
    overwrite:       new FormControl(false,      { nonNullable: true }),
    pauseImmichJobs: new FormControl(true,       { nonNullable: true }),
    dryRun:          new FormControl(false,      { nonNullable: true }),
    sessionTag:      new FormControl(false,      { nonNullable: true }),
    customTags:      new FormControl<string[]>([], { nonNullable: true }),
    deviceUuid:      new FormControl('$LOCALHOST',  { nonNullable: true }),
    noUi:            new FormControl(false,      { nonNullable: true }),
    apiTrace:        new FormControl(false,      { nonNullable: true }),
  });

  readonly folderForm = new FormGroup<FolderFormGroup>({
    sourcePath:         new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    recursive:          new FormControl(true,    { nonNullable: true }),
    dateFromName:       new FormControl(true,    { nonNullable: true }),
    ignoreSidecarFiles: new FormControl(false,   { nonNullable: true }),
    includeExtensions:  new FormControl('',      { nonNullable: true }),
    excludeExtensions:  new FormControl('',      { nonNullable: true }),
    includeType:        new FormControl<any>('all', { nonNullable: true }),
    dateRange:          new FormControl('',      { nonNullable: true }),
    banFiles:           new FormControl<string[]>([], { nonNullable: true }),
    folderAsAlbum:      new FormControl<any>('NONE', { nonNullable: true }),
    albumPathJoiner:    new FormControl(' / ',   { nonNullable: true }),
    intoAlbum:          new FormControl('',      { nonNullable: true }),
    folderAsTags:       new FormControl(false,   { nonNullable: true }),
    albumPicasa:        new FormControl(false,   { nonNullable: true }),
    manageBurst:        new FormControl<any>('NoStack', { nonNullable: true }),
    manageRawJpeg:      new FormControl<any>('NoStack', { nonNullable: true }),
    manageHeicJpeg:     new FormControl<any>('NoStack', { nonNullable: true }),
    epsonFastFoto:      new FormControl(false,   { nonNullable: true }),
  });

  readonly googlePhotosForm = new FormGroup<GooglePhotosFormGroup>({
    sourcePath:           new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    includeUnmatched:     new FormControl(false, { nonNullable: true }),
    includeArchived:      new FormControl(true,  { nonNullable: true }),
    includeTrashed:       new FormControl(false, { nonNullable: true }),
    includePartner:       new FormControl(true,  { nonNullable: true }),
    syncAlbums:           new FormControl(true,  { nonNullable: true }),
    includeUntitledAlbums:new FormControl(false, { nonNullable: true }),
    fromAlbumName:        new FormControl('',    { nonNullable: true }),
    partnerSharedAlbum:   new FormControl('',    { nonNullable: true }),
    takeoutTag:           new FormControl(true,  { nonNullable: true }),
    peopleTag:            new FormControl(true,  { nonNullable: true }),
    banFiles:             new FormControl<string[]>([], { nonNullable: true }),
  });

  readonly icloudForm = new FormGroup<ICloudFormGroup>({
    sourcePath:         new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    recursive:          new FormControl(true,    { nonNullable: true }),
    dateFromName:       new FormControl(true,    { nonNullable: true }),
    ignoreSidecarFiles: new FormControl(false,   { nonNullable: true }),
    includeExtensions:  new FormControl('',      { nonNullable: true }),
    excludeExtensions:  new FormControl('',      { nonNullable: true }),
    includeType:        new FormControl<any>('all', { nonNullable: true }),
    dateRange:          new FormControl('',      { nonNullable: true }),
    banFiles:           new FormControl<string[]>([], { nonNullable: true }),
    folderAsAlbum:      new FormControl<any>('NONE', { nonNullable: true }),
    albumPathJoiner:    new FormControl(' / ',   { nonNullable: true }),
    intoAlbum:          new FormControl('',      { nonNullable: true }),
    folderAsTags:       new FormControl(false,   { nonNullable: true }),
    albumPicasa:        new FormControl(false,   { nonNullable: true }),
    manageBurst:        new FormControl<any>('NoStack', { nonNullable: true }),
    manageRawJpeg:      new FormControl<any>('NoStack', { nonNullable: true }),
    manageHeicJpeg:     new FormControl<any>('NoStack', { nonNullable: true }),
    epsonFastFoto:      new FormControl(false,   { nonNullable: true }),
    memories:           new FormControl(false,   { nonNullable: true }),
  });

  // from-picasa reuses folderForm (albumPicasa is already there)

  readonly fromImmichForm = new FormGroup<FromImmichFormGroup>({
    fromServer:        new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    fromApiKey:        new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    fromSkipSsl:       new FormControl(false, { nonNullable: true }),
    fromClientTimeout: new FormControl('20m', { nonNullable: true }),
    fromFavorite:      new FormControl(false, { nonNullable: true }),
    fromArchived:      new FormControl(false, { nonNullable: true }),
    fromTrash:         new FormControl(false, { nonNullable: true }),
    fromNoAlbum:       new FormControl(false, { nonNullable: true }),
    fromAlbums:        new FormControl<string[]>([], { nonNullable: true }),
    fromTags:          new FormControl<string[]>([], { nonNullable: true }),
    fromPeople:        new FormControl<string[]>([], { nonNullable: true }),
    fromDateRange:     new FormControl('',    { nonNullable: true }),
    fromDeviceUuid:    new FormControl('',    { nonNullable: true }),
    fromMinimalRating: new FormControl(0,     { nonNullable: true }),
    fromMake:          new FormControl('',    { nonNullable: true }),
    fromModel:         new FormControl('',    { nonNullable: true }),
    fromCountry:       new FormControl('',    { nonNullable: true }),
    fromState:         new FormControl('',    { nonNullable: true }),
    fromCity:          new FormControl('',    { nonNullable: true }),
    fromPartners:      new FormControl(false, { nonNullable: true }),
  });

  // ── Reactive form value signals (toSignal bridges RxJS → Signals) ──────────
  // computed() can only track Angular signals, NOT plain .value reads.
  // valueChanges fires on every keystroke, making these signals reactive.
  private readonly _serverValues    = toSignal(this.serverForm.valueChanges,       { initialValue: this.serverForm.getRawValue() });
  private readonly _folderValues    = toSignal(this.folderForm.valueChanges,       { initialValue: this.folderForm.getRawValue() });
  private readonly _gPhotosValues   = toSignal(this.googlePhotosForm.valueChanges, { initialValue: this.googlePhotosForm.getRawValue() });
  private readonly _icloudValues    = toSignal(this.icloudForm.valueChanges,       { initialValue: this.icloudForm.getRawValue() });
  private readonly _fromImmichValues= toSignal(this.fromImmichForm.valueChanges,   { initialValue: this.fromImmichForm.getRawValue() });
  private readonly _commonValues    = toSignal(this.uploadCommonForm.valueChanges, { initialValue: this.uploadCommonForm.getRawValue() });

  // ── Computed signals ────────────────────────────────────────────────────────
  constructor(private commandBuilder: CommandBuilderService) {}

  readonly isValid = computed(() => {
    const source  = this.selectedSource();
    const server  = this._serverValues();
    const serverOk = (server.serverUrl ?? '').trim() !== ''
                  && (server.apiKey    ?? '').trim() !== '';

    if (source === 'from-immich') {
      const fi = this._fromImmichValues();
      return serverOk
          && (fi.fromServer ?? '').trim() !== ''
          && (fi.fromApiKey ?? '').trim() !== '';
    }

    const sourcePath = this._getSourcePath(source);
    return serverOk && sourcePath.trim() !== '';
  });

  readonly generatedCommand = computed(() =>
    this.commandBuilder.build(
      this.selectedSource(),
      this._serverValues() as any,
      this._commonValues() as any,
      this._getSourceValues(this.selectedSource()),
    )
  );

  private _getSourcePath(source: UploadSource): string {
    switch (source) {
      case 'from-folder':        return this._folderValues().sourcePath  ?? '';
      case 'from-google-photos': return this._gPhotosValues().sourcePath ?? '';
      case 'from-icloud':        return this._icloudValues().sourcePath  ?? '';
      case 'from-picasa':        return this._folderValues().sourcePath  ?? '';
      default:                   return '';
    }
  }

  private _getSourceValues(source: UploadSource): Record<string, unknown> {
    switch (source) {
      case 'from-folder':        return this._folderValues()     as any;
      case 'from-google-photos': return this._gPhotosValues()    as any;
      case 'from-icloud':        return this._icloudValues()     as any;
      case 'from-picasa':        return this._folderValues()     as any;
      case 'from-immich':        return this._fromImmichValues() as any;
    }
  }

}
