import { Injectable } from '@angular/core';
import {
  ServerConnectionValue,
  UploadCommonValue,
  UploadSource,
} from '../models/upload-config.model';

const DEFAULTS: Record<string, unknown> = {
  recursive: true,
  dateFromName: true,
  ignoreSidecarFiles: false,
  includeType: 'all',
  folderAsAlbum: 'NONE',
  albumPathJoiner: ' / ',
  folderAsTags: false,
  albumPicasa: false,
  manageBurst: 'NoStack',
  manageRawJpeg: 'NoStack',
  manageHeicJpeg: 'NoStack',
  epsonFastFoto: false,
  includeUnmatched: false,
  includeArchived: true,
  includeTrashed: false,
  includePartner: true,
  syncAlbums: true,
  includeUntitledAlbums: false,
  takeoutTag: true,
  peopleTag: true,
  memories: false,
  fromSkipSsl: false,
  fromClientTimeout: '20m',
  fromFavorite: false,
  fromArchived: false,
  fromTrash: false,
  fromNoAlbum: false,
  fromMinimalRating: 0,
  fromPartners: false,
  concurrentTasks: 4,
  onErrors: 'continue',
  overwrite: false,
  pauseImmichJobs: true,
  dryRun: false,
  sessionTag: false,
  deviceUuid: '$LOCALHOST',
  noUi: false,
  apiTrace: false,
  skipSsl: false,
  clientTimeout: '20m',
};

@Injectable({ providedIn: 'root' })
export class CommandBuilderService {

  build(
    source: UploadSource,
    server: ServerConnectionValue,
    common: UploadCommonValue,
    sourceForm: Record<string, unknown>,
  ): string[] {
    const args: string[] = ['upload', source];

    // Required connection flags (always emit)
    if (server.serverUrl) args.push('--server', server.serverUrl);
    if (server.apiKey)    args.push('--api-key', server.apiKey);

    // Optional server flags
    this.flag(args, '--skip-verify-ssl', server.skipSsl, false);
    this.flagStr(args, '--client-timeout', server.clientTimeout, '20m');

    // Common upload flags
    this.flagNum(args, '--concurrent-tasks', common.concurrentTasks, 4);
    this.flagStr(args, '--on-errors', common.onErrors, 'continue');
    this.flag(args, '--overwrite', common.overwrite, false);
    this.flag(args, '--pause-immich-jobs', common.pauseImmichJobs, true);
    this.flag(args, '--dry-run', common.dryRun, false);
    this.flag(args, '--session-tag', common.sessionTag, false);
    this.repeatable(args, '--tag', common.customTags);
    this.flagStr(args, '--device-uuid', common.deviceUuid, '$LOCALHOST');
    this.flag(args, '--no-ui', common.noUi, false);
    this.flag(args, '--api-trace', common.apiTrace, false);

    // Source-specific flags + positional path
    switch (source) {
      case 'from-folder':
      case 'from-picasa':
        this.appendFolderFlags(args, sourceForm);
        break;
      case 'from-google-photos':
        this.appendGooglePhotosFlags(args, sourceForm);
        break;
      case 'from-icloud':
        this.appendICloudFlags(args, sourceForm);
        break;
      case 'from-immich':
        this.appendFromImmichFlags(args, sourceForm);
        break;
    }

    return args;
  }

  /** Render args as a human-readable command string for display. */
  toDisplayString(args: string[]): string {
    return ['immich-go', ...args]
      .map(a => (a.includes(' ') ? `"${a}"` : a))
      .join(' ');
  }

  // ── Source flag builders ─────────────────────────────────────────────────

  private appendFolderFlags(args: string[], f: Record<string, unknown>) {
    this.flag(args, '--recursive', f['recursive'], true);
    this.flag(args, '--date-from-name', f['dateFromName'], true);
    this.flag(args, '--ignore-sidecar-files', f['ignoreSidecarFiles'], false);
    this.flagStr(args, '--include-extensions', f['includeExtensions']);
    this.flagStr(args, '--exclude-extensions', f['excludeExtensions']);
    this.flagStr(args, '--include-type', f['includeType'], 'all');
    this.flagStr(args, '--date-range', f['dateRange']);
    this.repeatable(args, '--ban-file', f['banFiles'] as string[]);
    this.flagStr(args, '--folder-as-album', f['folderAsAlbum'], 'NONE');
    this.flagStr(args, '--album-path-joiner', f['albumPathJoiner'], ' / ');
    this.flagStr(args, '--into-album', f['intoAlbum']);
    this.flag(args, '--folder-as-tags', f['folderAsTags'], false);
    this.flag(args, '--album-picasa', f['albumPicasa'], false);
    this.flagStr(args, '--manage-burst', f['manageBurst'], 'NoStack');
    this.flagStr(args, '--manage-raw-jpeg', f['manageRawJpeg'], 'NoStack');
    this.flagStr(args, '--manage-heic-jpeg', f['manageHeicJpeg'], 'NoStack');
    this.flag(args, '--manage-epson-fastfoto', f['epsonFastFoto'], false);
    if (f['sourcePath']) args.push(f['sourcePath'] as string);
  }

  private appendGooglePhotosFlags(args: string[], f: Record<string, unknown>) {
    this.flag(args, '--include-unmatched', f['includeUnmatched'], false);
    this.flag(args, '--include-archived', f['includeArchived'], true);
    this.flag(args, '--include-trashed', f['includeTrashed'], false);
    this.flag(args, '--include-partner', f['includePartner'], true);
    this.flag(args, '--sync-albums', f['syncAlbums'], true);
    this.flag(args, '--include-untitled-albums', f['includeUntitledAlbums'], false);
    this.flagStr(args, '--from-album-name', f['fromAlbumName']);
    this.flagStr(args, '--partner-shared-album', f['partnerSharedAlbum']);
    this.flag(args, '--takeout-tag', f['takeoutTag'], true);
    this.flag(args, '--people-tag', f['peopleTag'], true);
    this.repeatable(args, '--ban-file', f['banFiles'] as string[]);
    if (f['sourcePath']) args.push(f['sourcePath'] as string);
  }

  private appendICloudFlags(args: string[], f: Record<string, unknown>) {
    this.appendFolderFlags(args, f);
    this.flag(args, '--memories', f['memories'], false);
  }

  private appendFromImmichFlags(args: string[], f: Record<string, unknown>) {
    if (f['fromServer']) args.push('--from-server', f['fromServer'] as string);
    if (f['fromApiKey']) args.push('--from-api-key', f['fromApiKey'] as string);
    this.flag(args, '--from-skip-verify-ssl', f['fromSkipSsl'], false);
    this.flagStr(args, '--from-client-timeout', f['fromClientTimeout'], '20m');
    this.flag(args, '--from-favorite', f['fromFavorite'], false);
    this.flag(args, '--from-archived', f['fromArchived'], false);
    this.flag(args, '--from-trash', f['fromTrash'], false);
    this.flag(args, '--from-no-album', f['fromNoAlbum'], false);
    this.repeatable(args, '--from-albums', f['fromAlbums'] as string[]);
    this.repeatable(args, '--from-tags', f['fromTags'] as string[]);
    this.repeatable(args, '--from-people', f['fromPeople'] as string[]);
    this.flagStr(args, '--from-date-range', f['fromDateRange']);
    this.flagStr(args, '--from-device-uuid', f['fromDeviceUuid']);
    if ((f['fromMinimalRating'] as number) > 0) {
      args.push('--from-minimal-rating', String(f['fromMinimalRating']));
    }
    this.flagStr(args, '--from-make', f['fromMake']);
    this.flagStr(args, '--from-model', f['fromModel']);
    this.flagStr(args, '--from-country', f['fromCountry']);
    this.flagStr(args, '--from-state', f['fromState']);
    this.flagStr(args, '--from-city', f['fromCity']);
    this.flag(args, '--from-partners', f['fromPartners'], false);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  /** Emit a boolean flag only if it differs from the default. */
  private flag(args: string[], flag: string, value: unknown, defaultVal: boolean) {
    if (typeof value !== 'boolean') return;
    if (value === defaultVal) return;
    args.push(`${flag}=${value}`);
  }

  /** Emit a string flag only if non-empty and different from default. */
  private flagStr(args: string[], flag: string, value: unknown, defaultVal?: string) {
    const v = String(value ?? '').trim();
    if (!v || v === defaultVal) return;
    args.push(flag, v);
  }

  /** Emit a numeric flag only if different from default. */
  private flagNum(args: string[], flag: string, value: unknown, defaultVal: number) {
    const n = Number(value);
    if (isNaN(n) || n === defaultVal) return;
    args.push(flag, String(n));
  }

  /** Emit a flag once per non-empty item in an array. */
  private repeatable(args: string[], flag: string, values: string[] | null | undefined) {
    if (!values) return;
    for (const v of values) {
      const t = v.trim();
      if (t) args.push(flag, t);
    }
  }
}
