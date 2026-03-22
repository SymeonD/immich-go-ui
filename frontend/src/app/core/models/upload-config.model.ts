import { FormControl, FormGroup } from '@angular/forms';

// ─── Upload source (subcommand) ──────────────────────────────────────────────
export type UploadSource =
  | 'from-folder'
  | 'from-google-photos'
  | 'from-icloud'
  | 'from-picasa'
  | 'from-immich';

// ─── Performance preset ──────────────────────────────────────────────────────
export type PerformancePreset =
  | 'basic-home'
  | 'home-server'
  | 'dedicated-server'
  | 'enterprise';

export interface PerformancePresetConfig {
  label: string;
  concurrentTasks: number;
  onErrors: OnErrorsValue;
  sublabel: string;
}

export type OnErrorsValue = 'stop' | 'continue';

export const PERFORMANCE_PRESETS: Record<PerformancePreset, PerformancePresetConfig> = {
  'basic-home':       { label: 'Basic Home',       concurrentTasks: 2,  onErrors: 'stop',     sublabel: '2 tasks • Stop on error' },
  'home-server':      { label: 'Home Server',       concurrentTasks: 4,  onErrors: 'continue', sublabel: '4 tasks • Tolerate errors' },
  'dedicated-server': { label: 'Dedicated Server',  concurrentTasks: 10, onErrors: 'continue', sublabel: '10 tasks • Continue on error' },
  'enterprise':       { label: 'Enterprise',        concurrentTasks: 16, onErrors: 'continue', sublabel: '16 tasks • Max performance' },
};

// ─── Shared server connection (destination) ──────────────────────────────────
export interface ServerConnectionValue {
  serverUrl: string;
  apiKey: string;
  skipSsl: boolean;
  clientTimeout: string;
}

export type ServerConnectionGroup = {
  serverUrl: FormControl<string>;
  apiKey: FormControl<string>;
  skipSsl: FormControl<boolean>;
  clientTimeout: FormControl<string>;
};

// ─── Upload common flags ─────────────────────────────────────────────────────
export interface UploadCommonValue {
  concurrentTasks: number;
  onErrors: OnErrorsValue;
  overwrite: boolean;
  pauseImmichJobs: boolean;
  dryRun: boolean;
  sessionTag: boolean;
  customTags: string[];
  deviceUuid: string;
  noUi: boolean;
  apiTrace: boolean;
}

export type UploadCommonGroup = {
  concurrentTasks: FormControl<number>;
  onErrors: FormControl<OnErrorsValue>;
  overwrite: FormControl<boolean>;
  pauseImmichJobs: FormControl<boolean>;
  dryRun: FormControl<boolean>;
  sessionTag: FormControl<boolean>;
  customTags: FormControl<string[]>;
  deviceUuid: FormControl<string>;
  noUi: FormControl<boolean>;
  apiTrace: FormControl<boolean>;
};

// ─── from-folder / from-icloud / from-picasa shared flags ───────────────────
export type FolderAsAlbumValue = 'NONE' | 'FOLDER' | 'PATH';
export type IncludeTypeValue = 'all' | 'IMAGE' | 'VIDEO';
export type ManageBurstValue = 'NoStack' | 'Stack' | 'StackKeepRaw' | 'StackKeepJPEG';
export type ManageRawJpegValue = 'NoStack' | 'KeepRaw' | 'KeepJPG' | 'StackCoverRaw' | 'StackCoverJPG';
export type ManageHeicJpegValue = 'NoStack' | 'KeepHeic' | 'KeepJPG' | 'StackCoverHeic' | 'StackCoverJPG';

export interface FolderFormValue {
  // Source
  sourcePath: string;
  // Folder options
  recursive: boolean;
  dateFromName: boolean;
  ignoreSidecarFiles: boolean;
  // File filtering
  includeExtensions: string;
  excludeExtensions: string;
  includeType: IncludeTypeValue;
  dateRange: string;
  banFiles: string[];
  // Album management
  folderAsAlbum: FolderAsAlbumValue;
  albumPathJoiner: string;
  intoAlbum: string;
  folderAsTags: boolean;
  albumPicasa: boolean;
  // File management
  manageBurst: ManageBurstValue;
  manageRawJpeg: ManageRawJpegValue;
  manageHeicJpeg: ManageHeicJpegValue;
  epsonFastFoto: boolean;
}

export type FolderFormGroup = {
  sourcePath: FormControl<string>;
  recursive: FormControl<boolean>;
  dateFromName: FormControl<boolean>;
  ignoreSidecarFiles: FormControl<boolean>;
  includeExtensions: FormControl<string>;
  excludeExtensions: FormControl<string>;
  includeType: FormControl<IncludeTypeValue>;
  dateRange: FormControl<string>;
  banFiles: FormControl<string[]>;
  folderAsAlbum: FormControl<FolderAsAlbumValue>;
  albumPathJoiner: FormControl<string>;
  intoAlbum: FormControl<string>;
  folderAsTags: FormControl<boolean>;
  albumPicasa: FormControl<boolean>;
  manageBurst: FormControl<ManageBurstValue>;
  manageRawJpeg: FormControl<ManageRawJpegValue>;
  manageHeicJpeg: FormControl<ManageHeicJpegValue>;
  epsonFastFoto: FormControl<boolean>;
};

// ─── from-google-photos ──────────────────────────────────────────────────────
export interface GooglePhotosFormValue {
  sourcePath: string;
  includeUnmatched: boolean;
  includeArchived: boolean;
  includeTrashed: boolean;
  includePartner: boolean;
  syncAlbums: boolean;
  includeUntitledAlbums: boolean;
  fromAlbumName: string;
  partnerSharedAlbum: string;
  takeoutTag: boolean;
  peopleTag: boolean;
  banFiles: string[];
}

export type GooglePhotosFormGroup = {
  sourcePath: FormControl<string>;
  includeUnmatched: FormControl<boolean>;
  includeArchived: FormControl<boolean>;
  includeTrashed: FormControl<boolean>;
  includePartner: FormControl<boolean>;
  syncAlbums: FormControl<boolean>;
  includeUntitledAlbums: FormControl<boolean>;
  fromAlbumName: FormControl<string>;
  partnerSharedAlbum: FormControl<string>;
  takeoutTag: FormControl<boolean>;
  peopleTag: FormControl<boolean>;
  banFiles: FormControl<string[]>;
};

// ─── from-icloud ─────────────────────────────────────────────────────────────
export interface ICloudFormValue extends FolderFormValue {
  memories: boolean;
}

export type ICloudFormGroup = FolderFormGroup & {
  memories: FormControl<boolean>;
};

// ─── from-picasa ─────────────────────────────────────────────────────────────
// Picasa reuses FolderFormValue/Group (albumPicasa is already included)

// ─── from-immich (source server) ────────────────────────────────────────────
export interface FromImmichFormValue {
  fromServer: string;
  fromApiKey: string;
  fromSkipSsl: boolean;
  fromClientTimeout: string;
  fromFavorite: boolean;
  fromArchived: boolean;
  fromTrash: boolean;
  fromNoAlbum: boolean;
  fromAlbums: string[];
  fromTags: string[];
  fromPeople: string[];
  fromDateRange: string;
  fromDeviceUuid: string;
  fromMinimalRating: number;
  fromMake: string;
  fromModel: string;
  fromCountry: string;
  fromState: string;
  fromCity: string;
  fromPartners: boolean;
}

export type FromImmichFormGroup = {
  fromServer: FormControl<string>;
  fromApiKey: FormControl<string>;
  fromSkipSsl: FormControl<boolean>;
  fromClientTimeout: FormControl<string>;
  fromFavorite: FormControl<boolean>;
  fromArchived: FormControl<boolean>;
  fromTrash: FormControl<boolean>;
  fromNoAlbum: FormControl<boolean>;
  fromAlbums: FormControl<string[]>;
  fromTags: FormControl<string[]>;
  fromPeople: FormControl<string[]>;
  fromDateRange: FormControl<string>;
  fromDeviceUuid: FormControl<string>;
  fromMinimalRating: FormControl<number>;
  fromMake: FormControl<string>;
  fromModel: FormControl<string>;
  fromCountry: FormControl<string>;
  fromState: FormControl<string>;
  fromCity: FormControl<string>;
  fromPartners: FormControl<boolean>;
};

// ─── Execution events ────────────────────────────────────────────────────────
export interface LogEvent {
  line: string;
  ts: string;
}

export interface DoneEvent {
  exitCode: number;
  duration: string;
}

export interface LogLine {
  text: string;
  ts: string;
  html: string;
}

export type AppView = 'config' | 'progress' | 'results';
export type BinaryState = 'idle' | 'downloading' | 'ready' | 'error';

export interface BinaryStatus {
  status: BinaryState;
  version?: string;
  message?: string;
}
