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
