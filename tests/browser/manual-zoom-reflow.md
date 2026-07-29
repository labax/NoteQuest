# Manual 200% browser zoom/reflow check

This check is required because Chromium page-scale emulation and device-scale-factor overrides do
not faithfully represent browser zoom/reflow. Do not report either mechanism as NFR-A11Y-015
evidence.

## Required environment and steps

- Browser: Chrome for Testing 151.0.7922.34 (the Playwright-pinned Chromium build), normal tab.
- Build: production preview with the exact 40-character release identity visible in About/Credits.
- Viewports: 360×800 and 390×844 CSS pixels before zoom.
- Input: browser UI zoom command, not CSS transforms or DevTools page-scale emulation.

For each viewport:

1. Open `/`, select the first synthetic empty slot, and traverse every top-level destination with
   pointer and keyboard.
2. Open About/Credits and confirm the exact release identity before zoom.
3. Set browser zoom to 200% using Chrome's browser menu or `Ctrl`/`Cmd` + `+`.
4. Repeat the navigation journey and inspect the header, status details, navigation, workspace,
   contextual panel, slot cards, footer, and About cards.
5. Confirm no two-dimensional scrolling, clipping, overlap, pointer obstruction, obscured keyboard
   focus, missing controls, or altered/truncated release identity.

## Result for this review

**Not run.** The review environment is non-interactive and has no browser chrome, so it cannot apply
or inspect genuine browser UI zoom. The automated 360/390 checks are viewport/reflow evidence only
and are not represented as 200% browser-zoom evidence. A reviewer with interactive Chrome must record
the date, OS, browser version, release identity, both viewport results, and any defect before
NFR-A11Y-015 or UX-T009 can be marked passed.
