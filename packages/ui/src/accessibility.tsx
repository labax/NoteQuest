/* eslint-disable react-refresh/only-export-components -- Public accessibility module intentionally co-locates its small React adapters with the framework-neutral service. */
import { useEffect, useSyncExternalStore, type RefObject } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function visibleFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (element) => !element.hidden && element.getAttribute('aria-hidden') !== 'true',
  );
}

/** Focuses a programmatic destination such as a route heading or error summary. */
export function focusTarget(target: HTMLElement | null): boolean {
  if (target === null || !target.isConnected) return false;
  if (!target.matches(FOCUSABLE) && !target.hasAttribute('tabindex')) {
    target.setAttribute('tabindex', '-1');
  }
  target.focus();
  return document.activeElement === target;
}

/** Applies the UX rule: summary first, otherwise the first invalid control. */
export function focusValidationError(container: ParentNode, summary?: HTMLElement | null): boolean {
  return focusTarget(summary ?? container.querySelector<HTMLElement>('[aria-invalid="true"]'));
}

/** Blocking errors use an explicit summary and never rely on a live region alone. */
export function focusBlockingError(summary: HTMLElement | null): boolean {
  return focusTarget(summary);
}

export interface FocusContainment {
  deactivate(options?: { readonly restore?: boolean }): void;
}

/**
 * Moves focus into a dialog/sheet, contains Tab navigation, and restores its invoker.
 * Consumers remain responsible for labelled dialog semantics and an explicit close action.
 */
export function containFocus(
  container: HTMLElement,
  options: {
    readonly initialFocus?: HTMLElement | null;
    readonly invoker?: HTMLElement | null;
  } = {},
): FocusContainment {
  const invoker = options.invoker ?? (document.activeElement as HTMLElement | null);
  const keydown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;
    const targets = visibleFocusable(container);
    if (targets.length === 0) {
      event.preventDefault();
      focusTarget(container);
      return;
    }
    const first = targets[0]!;
    const last = targets[targets.length - 1]!;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  container.addEventListener('keydown', keydown);
  focusTarget(options.initialFocus ?? visibleFocusable(container)[0] ?? container);
  return {
    deactivate: ({ restore = true } = {}) => {
      container.removeEventListener('keydown', keydown);
      if (restore) focusTarget(invoker);
    },
  };
}

export function useContainedFocus(
  container: RefObject<HTMLElement | null>,
  open: boolean,
  initialFocus?: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    if (!open || container.current === null) return;
    const containment = containFocus(container.current, {
      ...(initialFocus === undefined ? {} : { initialFocus: initialFocus.current }),
    });
    return () => containment.deactivate();
  }, [container, initialFocus, open]);
}

export type AnnouncementKind =
  'saving' | 'saved' | 'failed' | 'offline-ready' | 'update' | 'route' | 'blocking-error';

export type AnnouncementPriority = 'polite' | 'assertive';

export interface Announcement {
  readonly id: number;
  readonly kind: AnnouncementKind;
  readonly message: string;
  readonly priority: AnnouncementPriority;
}

export interface AnnouncementService {
  announce(kind: AnnouncementKind, message: string): void;
  getSnapshot(): Announcement | null;
  subscribe(listener: () => void): () => void;
}

const assertiveKinds = new Set<AnnouncementKind>(['failed', 'blocking-error']);

/** Creates a bounded, deduplicating announcement channel for visible application states. */
export function createAnnouncementService(): AnnouncementService {
  let current: Announcement | null = null;
  let nextId = 1;
  const listeners = new Set<() => void>();
  return {
    announce(kind, rawMessage) {
      const message = rawMessage.trim();
      if (message === '' || (current?.kind === kind && current.message === message)) return;
      current = {
        id: nextId++,
        kind,
        message,
        priority: assertiveKinds.has(kind) ? 'assertive' : 'polite',
      };
      listeners.forEach((listener) => listener());
    },
    getSnapshot: () => current,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export function AnnouncementRegions({ service }: { readonly service: AnnouncementService }) {
  const announcement = useSyncExternalStore(
    service.subscribe,
    service.getSnapshot,
    service.getSnapshot,
  );
  return (
    <div className="nq-announcement-regions">
      <div
        className="visually-hidden"
        aria-label="Polite announcements"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement?.priority === 'polite' ? announcement.message : ''}
      </div>
      <div
        className="visually-hidden"
        aria-label="Assertive announcements"
        aria-live="assertive"
        aria-atomic="true"
      >
        {announcement?.priority === 'assertive' ? announcement.message : ''}
      </div>
    </div>
  );
}
