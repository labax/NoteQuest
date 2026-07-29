export const SHELL_NOTICE_STATUS = 'implementation-placeholder' as const;

export interface ShellNotice {
  readonly id:
    'project-status' | 'source-rights' | 'third-party' | 'storage' | 'privacy' | 'feedback';
  readonly heading: string;
  readonly paragraphs: readonly string[];
  readonly status: typeof SHELL_NOTICE_STATUS;
}

/**
 * Project-original interim copy for the offline shell. Legal, licensing, and release review must
 * replace or approve these records before they are treated as final public notices.
 */
export const shellNotices: readonly ShellNotice[] = [
  {
    id: 'project-status',
    heading: 'Project status',
    status: SHELL_NOTICE_STATUS,
    paragraphs: [
      'Implementation placeholder: this build is work in progress and is not a statement of final release approval.',
    ],
  },
  {
    id: 'source-rights',
    heading: 'Source and rights notices',
    status: SHELL_NOTICE_STATUS,
    paragraphs: [
      'Implementation placeholder: approved source credits, rights context, and release wording are pending content and licensing review.',
    ],
  },
  {
    id: 'third-party',
    heading: 'Third-party notices',
    status: SHELL_NOTICE_STATUS,
    paragraphs: [
      'Implementation placeholder: the reviewed dependency and asset notice inventory will replace this text before release.',
    ],
  },
  {
    id: 'storage',
    heading: 'Storage guidance',
    status: SHELL_NOTICE_STATUS,
    paragraphs: [
      'Implementation placeholder: saves belong to this browser profile. Clearing site data or removing the profile can remove them, so export support should be used when it becomes available.',
    ],
  },
  {
    id: 'privacy',
    heading: 'Privacy boundary',
    status: SHELL_NOTICE_STATUS,
    paragraphs: [
      'Implementation placeholder: this shell uses local browser storage and does not promise cloud backup. It does not silently submit saves, names, notes, history, or diagnostics.',
    ],
  },
  {
    id: 'feedback',
    heading: 'Voluntary feedback path',
    status: SHELL_NOTICE_STATUS,
    paragraphs: [
      'Implementation placeholder: no in-app submission endpoint is configured. A reviewed, optional feedback destination will be added here; using it will not automatically attach local data.',
    ],
  },
] as const;

export function getShellNotice(id: ShellNotice['id']): ShellNotice {
  const notice = shellNotices.find((candidate) => candidate.id === id);
  if (notice === undefined) throw new Error(`Unknown shell notice: ${id}`);
  return notice;
}
