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

  it('enters, contains, and restores focus for a modal or sheet', () => {
    document.body.innerHTML = `
      <button id="open">Open</button>
      <div id="dialog" role="dialog"><button id="cancel">Cancel</button><button id="confirm">Confirm</button></div>`;
    const open = document.querySelector<HTMLButtonElement>('#open')!;
    const dialog = document.querySelector<HTMLElement>('#dialog')!;
    const cancel = document.querySelector<HTMLButtonElement>('#cancel')!;
    const confirm = document.querySelector<HTMLButtonElement>('#confirm')!;
    open.focus();
    const containment = containFocus(dialog);
    expect(cancel).toHaveFocus();
    confirm.focus();
    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(cancel).toHaveFocus();
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
    expect(confirm).toHaveFocus();
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
