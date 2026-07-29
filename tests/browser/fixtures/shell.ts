/**
 * Browser-only, project-original shell fixtures. These route expectations and labels are not
 * bundled application content and deliberately avoid player saves or gameplay records.
 */
export const shellFixture = {
  initialHeading: 'Choose a local save slot',
  initialPath: '/',
  unknownPath: '/synthetic-missing-route',
  fallbackMessage: 'That page is not available. You are back at the save slots.',
  missingContextPath: '/town',
  missingContextMessage: 'Select a save slot before opening that destination.',
  unlockedDestinations: [
    { heading: 'Town', path: '/town' },
    { heading: 'Expedition', path: '/expedition' },
    { heading: 'Inventory', path: '/inventory' },
    { heading: 'History', path: '/history' },
    { heading: 'Manage local data', path: '/data' },
    { heading: 'Graveyard', path: '/graveyard' },
    { heading: 'About and credits', path: '/about' },
    { heading: 'Choose a local save slot', path: '/' },
  ],
} as const;
