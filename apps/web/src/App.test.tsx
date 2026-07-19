// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { App } from './App.tsx';

describe('App', () => {
  it('identifies the scaffold and static architecture boundary', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'NoteQuest' })).toBeInTheDocument();
    expect(screen.getByText(/strict TypeScript foundation/i)).toBeInTheDocument();
    expect(screen.getByText('None required')).toBeInTheDocument();
  });
});
