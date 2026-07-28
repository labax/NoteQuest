/* eslint-disable react-refresh/only-export-components -- Public accessibility module intentionally co-locates its small React adapters with the framework-neutral service. */
import { useEffect, useSyncExternalStore, type RefObject } from 'react';

const FOCUSABLE = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([type="hidden"]):not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'summary',
  'audio[controls]',
  'video[controls]',
  '[contenteditable="true"]',
  '[tabindex]',
].join(',');

function isHiddenByTree(element: HTMLElement): boolean {
  let current: HTMLElement | null = element;
  while (current !== null) {
    if (
      current.hidden ||
      current.hasAttribute('inert') ||
      current.getAttribute('aria-hidden') === 'true'
    ) {
      return true;
    }
    const style = getComputedStyle(current);
    if (
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      style.visibility === 'collapse' ||
      style.contentVisibility === 'hidden' ||
      style.opacity === '0'
    ) {
      return true;
    }
    if (current instanceof HTMLDetailsElement && !current.open) {
      const summary = Array.from(current.children).find(
        (child): child is HTMLElement =>
          child instanceof HTMLElement && child.tagName === 'SUMMARY',
      );
      if (summary === undefined || !summary.contains(element)) return true;
    }
    current = current.parentElement;
  }
  return false;
}

function isSequentiallyAvailable(element: HTMLElement): boolean {
  if (!element.isConnected || !element.matches(FOCUSABLE)) return false;
  if (
    element.matches(':disabled') ||
    element.getAttribute('aria-disabled') === 'true' ||
    element.tabIndex < 0
  ) {
    return false;
  }
  if (element instanceof HTMLElement && element.tagName === 'SUMMARY') {
    const details = element.parentElement;
    if (!(details instanceof HTMLDetailsElement)) return false;
    const firstSummary = Array.from(details.children).find((child) => child.tagName === 'SUMMARY');
    if (firstSummary !== element) return false;
  }
  return !isHiddenByTree(element);
}

function isBaseTabbable(element: HTMLElement, container: HTMLElement): boolean {
  if (!container.contains(element)) return false;
  if (!isSequentiallyAvailable(element)) return false;
  return true;
}

function radioGroup(radio: HTMLInputElement): HTMLInputElement[] {
  if (radio.name === '') return [radio];
  const root = radio.getRootNode();
  if (!(root instanceof Document || root instanceof ShadowRoot)) return [radio];
  return Array.from(root.querySelectorAll<HTMLInputElement>('input[type="radio"]')).filter(
    (candidate) => candidate.name === radio.name && candidate.form === radio.form,
  );
}

function isTabbable(element: HTMLElement, container: HTMLElement): boolean {
  if (!isBaseTabbable(element, container)) return false;
  if (!(element instanceof HTMLInputElement) || element.type !== 'radio' || element.name === '') {
    return true;
  }

  const group = radioGroup(element);
  const checked = group.find((candidate) => candidate.checked);
  if (checked !== undefined) return checked === element;
  return group.find((candidate) => isSequentiallyAvailable(candidate)) === element;
}

function visibleFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((element) =>
    isTabbable(element, container),
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
  const containerAvailable = container.isConnected && !isHiddenByTree(container);
  const initial =
    containerAvailable &&
    options.initialFocus !== null &&
    options.initialFocus !== undefined &&
    isTabbable(options.initialFocus, container)
      ? options.initialFocus
      : containerAvailable
        ? visibleFocusable(container)[0]
        : undefined;
  if (initial !== undefined) {
    if (!focusTarget(initial)) focusTarget(container);
  } else if (containerAvailable) {
    focusTarget(container);
  }
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
