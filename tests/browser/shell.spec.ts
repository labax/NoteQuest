import { expect, test, type Locator } from '@playwright/test';
import { shellFixture } from './fixtures/shell';

async function renderedReleaseId(page: import('@playwright/test').Page): Promise<string> {
  const version = await page.locator('.shell-footer span').first().textContent();
  return version?.replace(/^Version\s+/, '') ?? '';
}

async function expectNoHorizontalOverflow(page: import('@playwright/test').Page): Promise<void> {
  const evidence = await page.evaluate(() => {
    const clientWidth = document.documentElement.clientWidth;
    const offenders = Array.from(document.body.querySelectorAll('*')).flatMap((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      if (
        element.classList.contains('visually-hidden') ||
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        rect.width === 0 ||
        rect.height === 0 ||
        (rect.left >= -0.5 && rect.right <= clientWidth + 0.5)
      )
        return [];
      return [
        {
          element: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}${
            element.className ? `.${String(element.className).trim().replace(/\s+/g, '.')}` : ''
          }`,
          text: element.textContent?.trim().slice(0, 80) ?? '',
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        },
      ];
    });
    return { clientWidth, scrollWidth: document.body.scrollWidth, offenders };
  });
  expect(
    evidence.scrollWidth,
    `horizontal overflow: viewport=${evidence.clientWidth}, scrollWidth=${evidence.scrollWidth}; offenders=${JSON.stringify(evidence.offenders)}`,
  ).toBe(evidence.clientWidth);
  expect(
    evidence.offenders,
    `elements outside viewport: ${JSON.stringify(evidence.offenders)}`,
  ).toEqual([]);
}

async function expectPointerTarget(locator: Locator): Promise<void> {
  const hit = await locator.evaluate((control) => {
    const rect = control.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const target = document.elementFromPoint(x, y);
    return {
      reachable: target !== null && control.contains(target),
      control: control.textContent?.trim() ?? '',
      target: target
        ? `${target.tagName.toLowerCase()}${target.id ? `#${target.id}` : ''}.${String(target.className)}`
        : 'none',
      rect: { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom },
    };
  });
  expect(hit.reachable, `pointer target obstruction: ${JSON.stringify(hit)}`).toBe(true);
}

async function expectNoOverlap(controls: Locator): Promise<void> {
  const boxes = await controls.evaluateAll((elements) =>
    elements.map((element) => {
      const { left, right, top, bottom } = element.getBoundingClientRect();
      return { left, right, top, bottom };
    }),
  );
  for (let first = 0; first < boxes.length; first += 1) {
    for (let second = first + 1; second < boxes.length; second += 1) {
      const a = boxes[first]!;
      const b = boxes[second]!;
      const overlaps = a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
      expect(overlaps, `shell controls ${first + 1} and ${second + 1} overlap`).toBe(false);
    }
  }
}

async function durableStoreCounts(page: import('@playwright/test').Page) {
  return page.evaluate(async () => {
    const request = indexedDB.open('notequest-local-workspace');
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      const names = ['workspace', 'slots', 'records', 'events', 'snapshots'] as const;
      const transaction = database.transaction(names, 'readonly');
      const values = await Promise.all(
        names.map(
          (name) =>
            new Promise<number>((resolve, reject) => {
              const count = transaction.objectStore(name).count();
              count.onsuccess = () => resolve(count.result);
              count.onerror = () => reject(count.error);
            }),
        ),
      );
      return Object.fromEntries(names.map((name, index) => [name, values[index]!])) as Record<
        (typeof names)[number],
        number
      >;
    } finally {
      database.close();
    }
  });
}

test.beforeEach(async ({ page }) => {
  await page.goto(shellFixture.initialPath);
  await expect(page.getByRole('heading', { name: shellFixture.initialHeading })).toBeVisible();
});

test('loads the shell with truthful landmarks and empty save-slot readiness', async ({ page }) => {
  await expect(page.getByRole('banner')).toContainText('NoteQuest');
  await expect(page.getByRole('navigation', { name: 'Primary destinations' })).toBeVisible();
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('complementary', { name: 'Local data status' })).toBeVisible();
  await expect(page.getByRole('contentinfo')).toBeVisible();
  await expect(page.getByLabel('Polite announcements')).toHaveAttribute('aria-live', 'polite');
  await expect(page.getByLabel('Assertive announcements')).toHaveAttribute(
    'aria-live',
    'assertive',
  );
  await expect(page.getByRole('article')).toHaveCount(3);
  for (const [index, slot] of (await page.getByRole('article').all()).entries()) {
    await expect(slot.getByRole('heading', { name: `Slot ${index + 1}` })).toBeVisible();
    await expect(slot).toContainText('Empty — no local adventure yet.');
    await expect(slot.getByRole('button', { name: 'Start new game' })).toBeEnabled();
  }
  await expect(page.getByRole('status')).toHaveCount(0);
});

test('exposes labelled landmarks, heading structure, keyboard focus, and route announcements', async ({
  page,
}) => {
  await expect(page.getByRole('banner')).toHaveCount(1);
  await expect(page.getByRole('navigation', { name: 'Primary destinations' })).toHaveCount(1);
  await expect(page.getByRole('main')).toHaveCount(1);
  await expect(page.getByRole('complementary', { name: 'Local data status' })).toHaveCount(1);
  await expect(page.getByRole('contentinfo')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1, name: 'NoteQuest' })).toHaveCount(1);

  const workspace = page.getByRole('main');
  await expect(workspace).toHaveAttribute('aria-labelledby', 'workspace-title');
  await expect(workspace.getByRole('heading', { level: 2 })).toHaveCount(1);
  const context = page.getByRole('complementary', { name: 'Local data status' });
  await expect(context).toHaveAttribute('aria-labelledby', 'context-title');
  await expect(context.getByRole('heading', { level: 2, name: 'Local data status' })).toHaveCount(
    1,
  );

  const polite = page.getByLabel('Polite announcements');
  const assertive = page.getByLabel('Assertive announcements');
  await expect(polite).toHaveAttribute('aria-atomic', 'true');
  await expect(assertive).toHaveAttribute('aria-atomic', 'true');
  await expect(assertive).toBeEmpty();

  await expect(page.getByRole('heading', { name: shellFixture.initialHeading })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  const about = page.getByRole('button', { name: 'About and credits' });
  await expect(about).toBeFocused();
  await expect(about).toHaveCSS('outline-style', 'solid');
  await expectPointerTarget(about);
  await page.keyboard.press('Enter');

  const destination = page.getByRole('heading', { level: 2, name: 'About and credits' });
  await expect(destination).toBeFocused();
  await expect(destination).toHaveAttribute('tabindex', '-1');
  await expect(page.getByRole('button', { name: 'About and credits' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(polite).toHaveText('About and credits page.');
  await expect(assertive).toBeEmpty();
});

test('navigates every top-level destination after a synthetic empty slot is selected', async ({
  page,
}) => {
  await page.getByRole('article').first().getByRole('button', { name: 'Start new game' }).click();
  await expect(page.getByLabel('Adventurer name')).toBeFocused();

  for (const destination of shellFixture.unlockedDestinations) {
    const control = page.getByRole('button', { name: destination.heading, exact: true });
    await control.scrollIntoViewIfNeeded();
    await expect(control).toBeVisible();
    await expectPointerTarget(control);
    await control.click();
    const heading = page.getByRole('heading', { name: destination.heading, exact: true }).first();
    await expect(heading).toBeFocused();
    await expect(page).toHaveURL(new RegExp(`${destination.path.replace('/', '\\/')}\\?slot=`));
    await expectNoHorizontalOverflow(page);
  }

  for (const name of [
    'About and credits',
    'Graveyard',
    'Manage local data',
    'History',
    'Inventory',
    'Expedition',
    'Town',
    'Choose a local save slot',
  ]) {
    await page.keyboard.press('Shift+Tab');
    await expect(page.getByRole('button', { name, exact: true })).toBeFocused();
  }
});

test('@phone keeps the exact production release identity readable on phone widths', async ({
  page,
}) => {
  const expectedReleaseId = await renderedReleaseId(page);
  expect(expectedReleaseId).toMatch(/^[a-f0-9]{40}$/);
  await page.getByRole('button', { name: 'About and credits' }).click();
  const identity = page.locator('.release-identity');
  await expect(identity).toHaveText(expectedReleaseId);
  await expect(identity).toBeVisible();
  const containment = await identity.evaluate((element) => {
    const value = element.getBoundingClientRect();
    const card = element.closest('.notice-card')?.getBoundingClientRect();
    return card
      ? value.left >= card.left &&
          value.right <= card.right &&
          value.top >= card.top &&
          value.bottom <= card.bottom
      : false;
  });
  expect(containment, 'release identity must remain inside its About card').toBe(true);
  await expectNoHorizontalOverflow(page);
  const about = page.getByRole('button', { name: 'About and credits' });
  await about.scrollIntoViewIfNeeded();
  await expectPointerTarget(about);
});

test('reloads the selected route without losing save-slot readiness', async ({ page }) => {
  await page.getByRole('article').first().getByRole('button', { name: 'Start new game' }).click();
  await page.getByRole('button', { name: shellFixture.initialHeading }).click();
  const selectedUrl = page.url();

  await page.reload();
  await expect(page).toHaveURL(selectedUrl);
  await expect(page.getByRole('heading', { name: shellFixture.initialHeading })).toBeFocused();
  await expect(page.getByRole('article')).toHaveCount(3);
  await expect(page.getByRole('article').first()).toContainText('Empty — no local adventure yet.');
  await expect(page).toHaveTitle('Save Slots · NoteQuest');
});

test('creates once and reloads identical durable evidence without extra writes', async ({
  page,
}) => {
  await page.getByRole('article').first().getByRole('button', { name: 'Start new game' }).click();
  await page.getByLabel('Adventurer name').fill('Browser Hero');
  await page.getByRole('button', { name: 'Create and save adventurer' }).click();
  const committed = page.getByRole('heading', { name: 'Browser Hero' });
  await expect(committed).toBeVisible();
  await expect(page.getByText('Saved', { exact: true })).toBeVisible();
  const evidence = await page.locator('.creation-result').textContent();
  const counts = await durableStoreCounts(page);
  expect(counts.records).toBeGreaterThanOrEqual(7);
  expect(counts.events).toBe(1);
  expect(counts.snapshots).toBe(1);
  expect(counts.workspace).toBeGreaterThanOrEqual(2);

  await page.reload();
  await expect(committed).toBeVisible();
  expect(await page.locator('.creation-result').textContent()).toBe(evidence);
  expect(await durableStoreCounts(page)).toEqual(counts);
  await expectNoHorizontalOverflow(page);
});

test('falls back safely from an unknown top-level route', async ({ page }) => {
  await page.goto(shellFixture.unknownPath);
  await expect(page.getByRole('heading', { name: shellFixture.initialHeading })).toBeVisible();
  await expect(page.getByRole('status')).toContainText(shellFixture.fallbackMessage);
  await expect(page).toHaveURL(new RegExp(`${shellFixture.unknownPath}$`));
});

test('falls back truthfully when a guarded route is loaded without a slot', async ({ page }) => {
  await page.goto(shellFixture.missingContextPath);
  await expect(page.getByRole('heading', { name: shellFixture.initialHeading })).toBeFocused();
  await expect(page.getByRole('status')).toContainText(shellFixture.missingContextMessage);
  await expect(page.getByRole('button', { name: 'Town' })).toBeDisabled();
  await expect(page).toHaveURL(new RegExp(`${shellFixture.missingContextPath}$`));
});

test('keeps required shell controls visible and separate at the configured viewport', async ({
  page,
}, testInfo) => {
  const viewport = page.viewportSize();
  const isPhone = testInfo.project.name.startsWith('chromium-phone-');
  const expectedWidth = testInfo.project.name === 'chromium-phone-360' ? 360 : isPhone ? 390 : 1280;
  expect(viewport?.width).toBe(expectedWidth);

  const nav = page.getByRole('navigation', { name: 'Primary destinations' });
  const controls = nav.getByRole('button');
  await expect(controls.first()).toBeVisible();
  await expectNoOverlap(controls);

  const { workspace, context, slots } = await page.evaluate(() => {
    const rect = (element: Element) => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return { x, y, width, height };
    };
    const workspaceElement = document.querySelector('.workspace');
    const contextElement = document.querySelector('.context-panel');
    if (workspaceElement === null || contextElement === null)
      throw new Error('Responsive shell regions were not found.');
    return {
      workspace: rect(workspaceElement),
      context: rect(contextElement),
      slots: Array.from(document.querySelectorAll('.slot-card'), rect),
    };
  });

  expect(slots).toHaveLength(3);
  if (isPhone) {
    expect(context.y).toBeGreaterThanOrEqual(workspace.y + workspace.height);
    expect(slots[1]!.y).toBeGreaterThanOrEqual(slots[0]!.y + slots[0]!.height);
    expect(slots[2]!.y).toBeGreaterThanOrEqual(slots[1]!.y + slots[1]!.height);
    for (const slot of slots) expect(slot.width).toBeGreaterThanOrEqual(250);

    const buttonHeights = await page
      .getByRole('button')
      .evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect().height));
    for (const height of buttonHeights) expect(height).toBeGreaterThanOrEqual(44);
  } else {
    expect(Math.abs(context.y - workspace.y)).toBeLessThan(2);
    expect(context.x).toBeGreaterThanOrEqual(workspace.x + workspace.width);
    expect(
      Math.max(...slots.map((slot) => slot.y)) - Math.min(...slots.map((slot) => slot.y)),
    ).toBeLessThan(2);
    expect(slots[1]!.x).toBeGreaterThanOrEqual(slots[0]!.x + slots[0]!.width);
    expect(slots[2]!.x).toBeGreaterThanOrEqual(slots[1]!.x + slots[1]!.width);
  }

  const storageControl = page.getByRole('button', { name: 'Learn about local storage' });
  await storageControl.scrollIntoViewIfNeeded();
  await expect(storageControl).toBeInViewport();
  await expectNoHorizontalOverflow(page);
});

test('@pwa installs the production service worker and relaunches offline', async ({
  page,
  context,
}) => {
  const expectedReleaseId = await renderedReleaseId(page);
  expect(expectedReleaseId).toMatch(/^[a-f0-9]{40}$/);
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)), {
      timeout: 15_000,
    })
    .toBe(true);
  await page.getByText('Offline and update details').click();
  await expect(page.getByText('supported', { exact: true })).toBeVisible();
  await expect(page.getByText('ready', { exact: true })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('available', { exact: true })).toBeVisible();

  const readiness = await page.evaluate(async () => {
    const controller = navigator.serviceWorker.controller;
    if (controller === null) return { ready: false, cacheNames: [], cachedResponses: 0 };
    const requestId = `playwright-${crypto.randomUUID()}`;
    const ready = await new Promise<boolean>((resolve, reject) => {
      const timeout = window.setTimeout(
        () => reject(new Error('readiness response timed out')),
        5_000,
      );
      const receive = (event: MessageEvent<unknown>) => {
        const value = event.data;
        if (
          typeof value !== 'object' ||
          value === null ||
          Reflect.get(value, 'type') !== 'NOTEQUEST_OFFLINE_READINESS_RESULT' ||
          Reflect.get(value, 'requestId') !== requestId
        )
          return;
        window.clearTimeout(timeout);
        navigator.serviceWorker.removeEventListener('message', receive);
        resolve(Reflect.get(value, 'ready') === true);
      };
      navigator.serviceWorker.addEventListener('message', receive);
      controller.postMessage({ type: 'NOTEQUEST_CHECK_OFFLINE_READINESS', requestId });
    });
    const cacheNames = await caches.keys();
    const cachedResponses = (
      await Promise.all(cacheNames.map(async (name) => (await caches.open(name)).keys()))
    ).flat().length;
    return { ready, cacheNames, cachedResponses };
  });
  expect(readiness.ready).toBe(true);
  expect(readiness.cacheNames).toContain(`nq-shell-${expectedReleaseId}`);
  expect(readiness.cachedResponses).toBeGreaterThanOrEqual(3);

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: shellFixture.initialHeading })).toBeVisible();
  await expect(page.getByLabel('Application status')).toContainText('Offline ready');
  await expect.poll(() => page.evaluate(async () => (await fetch('/')).ok)).toBe(true);
  await expect
    .poll(() =>
      page.evaluate(async () => {
        try {
          await fetch('/synthetic-uncached-probe', { headers: { accept: 'application/json' } });
          return false;
        } catch {
          return true;
        }
      }),
    )
    .toBe(true);
});
