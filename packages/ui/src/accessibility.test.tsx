// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  AnnouncementRegions,
  containFocus,
  createAnnouncementService,
  focusBlockingError,
  focusTarget,
  focusValidationError,
} from './accessibility';

describe('focus foundations', () => {
  it('focuses route headings and validation or blocking summaries', () => {
    document.body.innerHTML = `
      <h1 id="route">Destination</h1>
      <form><input aria-invalid="true"><div id="summary">Fix these fields</div></form>`;
    const heading = document.querySelector<HTMLElement>('#route');
    const summary = document.querySelector<HTMLElement>('#summary');
    expect(focusTarget(heading)).toBe(true);
    expect(heading).toHaveFocus();
    expect(heading).toHaveAttribute('tabindex', '-1');
    expect(focusValidationError(document.querySelector('form')!)).toBe(true);
    expect(document.querySelector('input')).toHaveFocus();
    expect(focusBlockingError(summary)).toBe(true);
    expect(summary).toHaveFocus();
  });

  it('ignores hidden, inert, aria-hidden, disabled, and negative-tabindex entry targets', () => {
    document.body.innerHTML = `
      <button id="open">Open</button>
      <div id="dialog" role="dialog">
        <input id="hidden-input" type="hidden">
        <div hidden><button id="hidden-ancestor">Hidden</button></div>
        <div aria-hidden="true"><button id="aria-hidden-ancestor">ARIA hidden</button></div>
        <div inert><button id="inert-ancestor">Inert</button></div>
        <div style="display: none"><button id="css-hidden-ancestor">CSS hidden</button></div>
        <button id="disabled" disabled>Disabled</button>
        <button id="aria-disabled" aria-disabled="true">ARIA disabled</button>
        <button id="negative" tabindex="-1">Negative</button>
        <button id="cancel">Cancel</button>
        <button id="confirm">Confirm</button>
      </div>`;
    const open = document.querySelector<HTMLButtonElement>('#open')!;
    const dialog = document.querySelector<HTMLElement>('#dialog')!;
    const cancel = document.querySelector<HTMLButtonElement>('#cancel')!;
    const confirm = document.querySelector<HTMLButtonElement>('#confirm')!;
    open.focus();
    const containment = containFocus(dialog);
    expect(cancel).toHaveFocus();

    // Forward and backward wrapping use the usable targets at the DOM-order edges.
    confirm.focus();
    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(cancel).toHaveFocus();
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
    expect(confirm).toHaveFocus();
    containment.deactivate();
    expect(open).toHaveFocus();
  });

  it('falls back from an unusable explicit target and cleans up containment', () => {
    document.body.innerHTML = `
      <button id="open">Open</button>
      <div id="dialog" role="dialog">
        <button id="unusable" hidden>Hidden initial target</button>
        <button id="first">First usable target</button>
        <button id="last">Last usable target</button>
      </div>`;
    const open = document.querySelector<HTMLButtonElement>('#open')!;
    const dialog = document.querySelector<HTMLElement>('#dialog')!;
    const unusable = document.querySelector<HTMLButtonElement>('#unusable')!;
    const first = document.querySelector<HTMLButtonElement>('#first')!;
    const last = document.querySelector<HTMLButtonElement>('#last')!;
    open.focus();
    const containment = containFocus(dialog, { initialFocus: unusable });
    expect(first).toHaveFocus();
    containment.deactivate({ restore: false });
    last.focus();
    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(last).toHaveFocus();
  });

  it('focuses the container when a dialog has no tabbable descendants and restores its invoker', () => {
    document.body.innerHTML = `
      <button id="open">Open</button>
      <div id="dialog" role="dialog"><input type="hidden"><button hidden>Hidden</button></div>`;
    const open = document.querySelector<HTMLButtonElement>('#open')!;
    const dialog = document.querySelector<HTMLElement>('#dialog')!;
    open.focus();
    const containment = containFocus(dialog);
    expect(dialog).toHaveFocus();
    expect(dialog).toHaveAttribute('tabindex', '-1');
    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(dialog).toHaveFocus();
    containment.deactivate();
    expect(open).toHaveFocus();
  });

  it.each([
    [
      'hidden',
      (wrapper: HTMLElement) => (wrapper.hidden = true),
      (wrapper: HTMLElement) => (wrapper.hidden = false),
    ],
    [
      'inert',
      (wrapper: HTMLElement) => wrapper.setAttribute('inert', ''),
      (wrapper: HTMLElement) => wrapper.removeAttribute('inert'),
    ],
    [
      'aria-hidden',
      (wrapper: HTMLElement) => wrapper.setAttribute('aria-hidden', 'true'),
      (wrapper: HTMLElement) => wrapper.removeAttribute('aria-hidden'),
    ],
    [
      'display',
      (wrapper: HTMLElement) => (wrapper.style.display = 'none'),
      (wrapper: HTMLElement) => wrapper.style.removeProperty('display'),
    ],
    [
      'visibility',
      (wrapper: HTMLElement) => (wrapper.style.visibility = 'hidden'),
      (wrapper: HTMLElement) => wrapper.style.removeProperty('visibility'),
    ],
    [
      'content visibility',
      (wrapper: HTMLElement) => (wrapper.style.contentVisibility = 'hidden'),
      (wrapper: HTMLElement) => wrapper.style.removeProperty('content-visibility'),
    ],
  ])(
    'does not enter a dialog under a %s ancestor and can enter after recovery',
    (_name, hide, reveal) => {
      document.body.innerHTML = `
        <button id="open">Open</button>
        <div id="wrapper"><div id="dialog" role="dialog"><button id="inside">Inside</button></div></div>`;
      const open = document.querySelector<HTMLButtonElement>('#open')!;
      const wrapper = document.querySelector<HTMLElement>('#wrapper')!;
      const dialog = document.querySelector<HTMLElement>('#dialog')!;
      const inside = document.querySelector<HTMLButtonElement>('#inside')!;
      hide(wrapper);
      open.focus();

      const unavailable = containFocus(dialog);
      expect(open).toHaveFocus();
      expect(dialog).not.toHaveAttribute('tabindex');
      unavailable.deactivate();
      expect(open).toHaveFocus();

      reveal(wrapper);
      const available = containFocus(dialog);
      expect(inside).toHaveFocus();
      available.deactivate();
      expect(open).toHaveFocus();
    },
  );

  it('uses the checked radio as the group sequential-focus candidate and wraps to it', () => {
    document.body.innerHTML = `
      <button id="open">Open</button>
      <div id="dialog" role="dialog">
        <input id="unchecked" type="radio" name="route">
        <input id="checked" type="radio" name="route" checked>
        <button id="close">Close</button>
      </div>`;
    const open = document.querySelector<HTMLButtonElement>('#open')!;
    const dialog = document.querySelector<HTMLElement>('#dialog')!;
    const unchecked = document.querySelector<HTMLInputElement>('#unchecked')!;
    const checked = document.querySelector<HTMLInputElement>('#checked')!;
    const close = document.querySelector<HTMLButtonElement>('#close')!;
    open.focus();

    const containment = containFocus(dialog, { initialFocus: unchecked });
    expect(checked).toHaveFocus();
    close.focus();
    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(checked).toHaveFocus();
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
    expect(close).toHaveFocus();
    containment.deactivate();
    expect(open).toHaveFocus();
  });

  it('uses the first enabled radio when a named group has no checked member', () => {
    document.body.innerHTML = `
      <button id="open">Open</button>
      <div id="dialog" role="dialog">
        <input id="disabled" type="radio" name="route" disabled>
        <input id="first" type="radio" name="route">
        <input id="second" type="radio" name="route">
        <button id="close">Close</button>
      </div>`;
    const open = document.querySelector<HTMLButtonElement>('#open')!;
    const dialog = document.querySelector<HTMLElement>('#dialog')!;
    const first = document.querySelector<HTMLInputElement>('#first')!;
    const close = document.querySelector<HTMLButtonElement>('#close')!;
    open.focus();

    const containment = containFocus(dialog);
    expect(first).toHaveFocus();
    close.focus();
    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(first).toHaveFocus();
    containment.deactivate();
    expect(open).toHaveFocus();
  });

  it('does not substitute an unchecked radio for a disabled checked group member', () => {
    document.body.innerHTML = `
      <button id="open">Open</button>
      <div id="dialog" role="dialog">
        <input type="radio" name="route" checked disabled>
        <input id="unchecked" type="radio" name="route">
        <button id="close">Close</button>
      </div>`;
    const open = document.querySelector<HTMLButtonElement>('#open')!;
    const dialog = document.querySelector<HTMLElement>('#dialog')!;
    const close = document.querySelector<HTMLButtonElement>('#close')!;
    open.focus();

    const containment = containFocus(dialog);
    expect(close).toHaveFocus();
    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(close).toHaveFocus();
    containment.deactivate();
    expect(open).toHaveFocus();
  });

  it('uses only the first summary in a details element as a native sequential target', () => {
    document.body.innerHTML = `
      <button id="open">Open</button>
      <div id="dialog" role="dialog">
        <a id="no-href">Not a link</a>
        <details>
          <summary id="first-summary">Details</summary>
          <summary id="second-summary">Not a disclosure control</summary>
        </details>
        <button id="close">Close</button>
      </div>`;
    const open = document.querySelector<HTMLButtonElement>('#open')!;
    const dialog = document.querySelector<HTMLElement>('#dialog')!;
    const firstSummary = document.querySelector<HTMLElement>('#first-summary')!;
    const close = document.querySelector<HTMLButtonElement>('#close')!;
    open.focus();

    const containment = containFocus(dialog);
    expect(firstSummary).toHaveFocus();
    close.focus();
    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(firstSummary).toHaveFocus();
    containment.deactivate();
    expect(open).toHaveFocus();
  });
});

describe('announcement foundations', () => {
  it('renders polite and assertive text and suppresses identical repeats', () => {
    const service = createAnnouncementService();
    const listener = vi.fn();
    service.subscribe(listener);
    render(<AnnouncementRegions service={service} />);
    act(() => service.announce('saving', 'Saving…'));
    expect(screen.getByLabelText('Polite announcements')).toHaveTextContent('Saving…');
    service.announce('saving', 'Saving…');
    expect(listener).toHaveBeenCalledTimes(1);
    act(() => service.announce('failed', 'Save failed.'));
    expect(screen.getByLabelText('Assertive announcements')).toHaveTextContent('Save failed.');
    expect(screen.getByLabelText('Polite announcements')).toBeEmptyDOMElement();
  });
});
