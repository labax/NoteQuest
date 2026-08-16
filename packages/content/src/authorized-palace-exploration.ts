import type {
  PalaceContentId,
  PalaceContentManifest,
  PalaceManifestEntry,
  PalaceRangeReference,
  PalaceSourceReference,
} from './palace-manifest.ts';
import { authorizedNoteQuestAttributionNotice } from './authorized-notequest-adventurer-creation.ts';

export const authorizedPalaceExplorationContentVersion = '1.0.0' as const;
export const authorizedPalaceExplorationRulesVersion = 'digital-rules-specification-v0.1' as const;

type ExplorationTableId =
  | 'palace.exploration.table.door-state.v1'
  | 'palace.exploration.table.segment-from-staircase.v1'
  | 'palace.exploration.table.segment-from-corridor.v1'
  | 'palace.exploration.table.segment-from-room.v1'
  | 'palace.exploration.table.secret-passage.v1'
  | 'palace.exploration.table.trap.v1'
  | 'palace.exploration.table.room-content.v1'
  | 'palace.exploration.table.monster.v1';

interface ExplorationRowDefinition {
  readonly id: PalaceContentId;
  readonly range: PalaceRangeReference;
  readonly label: string;
  readonly outcome: Record<string, unknown>;
}

interface ExplorationTableDefinition {
  readonly id: ExplorationTableId;
  readonly label: string;
  readonly dice: '1d6' | '2d6';
  readonly inventoryId: string;
  readonly sourcePage: 7 | 12 | 13;
  readonly originCategory: 'staircase' | 'corridor' | 'room' | null;
  readonly rows: readonly ExplorationRowDefinition[];
}

const range = (
  dice: '1d6' | '2d6',
  rangeId: string,
  from: number,
  to = from,
): PalaceRangeReference => ({ dice, rangeId, from, to });

const row = (
  id: PalaceContentId,
  rangeReference: PalaceRangeReference,
  label: string,
  outcome: Record<string, unknown>,
): ExplorationRowDefinition => ({ id, range: rangeReference, label, outcome });

const segmentOutcome = (
  destinationKind: 'corridor' | 'room' | 'staircase',
  outwardDoorCount: number,
  roomSize: 'small' | 'medium' | 'wide' | 'large' | null = null,
  hasPillars = false,
) => ({ destinationKind, outwardDoorCount, roomSize, hasPillars });

const doorStateTable: ExplorationTableDefinition = {
  id: 'palace.exploration.table.door-state.v1',
  label: 'Door state',
  dice: '1d6',
  inventoryId: 'INV-NQ-013',
  sourcePage: 7,
  originCategory: null,
  rows: [
    row(
      'palace.exploration.door-state.trapped.v1',
      range('1d6', 'door-state-1', 1),
      'Trapped door',
      { doorState: 'trapped' },
    ),
    row(
      'palace.exploration.door-state.locked.v1',
      range('1d6', 'door-state-2-3', 2, 3),
      'Locked door',
      { doorState: 'locked' },
    ),
    row(
      'palace.exploration.door-state.unlocked.v1',
      range('1d6', 'door-state-4-6', 4, 6),
      'Unlocked door',
      { doorState: 'unlocked' },
    ),
  ],
};

const staircaseSegmentTable: ExplorationTableDefinition = {
  id: 'palace.exploration.table.segment-from-staircase.v1',
  label: 'Segment from staircase',
  dice: '1d6',
  inventoryId: 'INV-PAL-SEG',
  sourcePage: 12,
  originCategory: 'staircase',
  rows: [1, 2, 3, 4, 5, 6].map((roll, index) =>
    row(
      `palace.exploration.segment-from-staircase.${roll}.v1`,
      range('1d6', `segment-from-staircase-${roll}`, roll),
      `Corridor with ${[1, 2, 2, 2, 3, 3][index]} outward door${roll === 1 ? '' : 's'}`,
      segmentOutcome('corridor', [1, 2, 2, 2, 3, 3][index]!),
    ),
  ),
};

const corridorSegmentRows = [
  ['small', 1],
  ['medium', 1],
  ['wide', 1],
  ['wide', 2],
  ['large', 2],
] as const;

const corridorSegmentTable: ExplorationTableDefinition = {
  id: 'palace.exploration.table.segment-from-corridor.v1',
  label: 'Segment from corridor',
  dice: '1d6',
  inventoryId: 'INV-PAL-SEG',
  sourcePage: 12,
  originCategory: 'corridor',
  rows: [
    ...corridorSegmentRows.map(([roomSize, outwardDoorCount], index) =>
      row(
        `palace.exploration.segment-from-corridor.${index + 1}.v1`,
        range('1d6', `segment-from-corridor-${index + 1}`, index + 1),
        `${roomSize} room with ${outwardDoorCount} outward door${outwardDoorCount === 1 ? '' : 's'}`,
        segmentOutcome('room', outwardDoorCount, roomSize),
      ),
    ),
    row(
      'palace.exploration.segment-from-corridor.6.v1',
      range('1d6', 'segment-from-corridor-6', 6),
      'Staircase with 1 outward door',
      segmentOutcome('staircase', 1),
    ),
  ],
};

const roomSegmentRows = [
  ['small', false],
  ['medium', false],
  ['medium', false],
  ['wide', false],
  ['large', true],
] as const;

const roomSegmentTable: ExplorationTableDefinition = {
  id: 'palace.exploration.table.segment-from-room.v1',
  label: 'Segment from room',
  dice: '1d6',
  inventoryId: 'INV-PAL-SEG',
  sourcePage: 12,
  originCategory: 'room',
  rows: [
    ...roomSegmentRows.map(([roomSize, hasPillars], index) =>
      row(
        `palace.exploration.segment-from-room.${index + 1}.v1`,
        range('1d6', `segment-from-room-${index + 1}`, index + 1),
        `${roomSize} room${hasPillars ? ' with pillars' : ''}`,
        segmentOutcome('room', index === 0 ? 1 : 0, roomSize, hasPillars),
      ),
    ),
    row(
      'palace.exploration.segment-from-room.6.v1',
      range('1d6', 'segment-from-room-6', 6),
      'Staircase with 1 outward door',
      segmentOutcome('staircase', 1),
    ),
  ],
};

const secretPassageTable: ExplorationTableDefinition = {
  id: 'palace.exploration.table.secret-passage.v1',
  label: 'Secret-passage search result',
  dice: '1d6',
  inventoryId: 'INV-PAL-SEC',
  sourcePage: 12,
  originCategory: null,
  rows: [
    row(
      'palace.exploration.secret-passage.trap.v1',
      range('1d6', 'secret-passage-1', 1),
      'Trap found',
      { discovery: { kind: 'trap', referenceId: 'palace.exploration.table.trap.v1' } },
    ),
    row(
      'palace.exploration.secret-passage.none.v1',
      range('1d6', 'secret-passage-2-3', 2, 3),
      'Nothing found',
      { discovery: { kind: 'none' } },
    ),
    row(
      'palace.exploration.secret-passage.chest.v1',
      range('1d6', 'secret-passage-4-5', 4, 5),
      'Hidden chest found',
      { discovery: { kind: 'chest', hidden: true } },
    ),
    row(
      'palace.exploration.secret-passage.staircase.v1',
      range('1d6', 'secret-passage-6', 6),
      'Secret staircase door found',
      { discovery: { kind: 'secret-door', destinationKind: 'staircase' } },
    ),
  ],
};

const trapTable: ExplorationTableDefinition = {
  id: 'palace.exploration.table.trap.v1',
  label: 'Trap effect',
  dice: '1d6',
  inventoryId: 'INV-PAL-TRAP',
  sourcePage: 12,
  originCategory: null,
  rows: [
    row('palace.exploration.trap.blade.v1', range('1d6', 'trap-1', 1), 'Blade trap', {
      effect: {
        kind: 'secondary-roll',
        dice: '1d6',
        outcomes: [
          { from: 1, to: 1, operation: 'death' },
          { from: 2, to: 2, operation: 'lose-arm', amount: 1 },
          { from: 3, to: 6, operation: 'none' },
        ],
      },
    }),
    row('palace.exploration.trap.acid.v1', range('1d6', 'trap-2', 2), 'Acid trap', {
      effect: { kind: 'damage', amount: 5 },
    }),
    row('palace.exploration.trap.pit.v1', range('1d6', 'trap-3', 3), 'Pit trap', {
      effect: { kind: 'spend-physical-torch', amount: 1 },
    }),
    row('palace.exploration.trap.dart.v1', range('1d6', 'trap-4', 4), 'Dart trap', {
      effect: { kind: 'damage', amount: 1 },
    }),
    row('palace.exploration.trap.none.v1', range('1d6', 'trap-5-6', 5, 6), 'Inactive trap', {
      effect: { kind: 'none' },
    }),
  ],
};

const roomContentRows = [
  [2, 'Archive', { roomKind: 'library', secretSearchEligible: true, discovery: { kind: 'none' } }],
  [
    3,
    'Kitchen cache',
    { roomKind: 'kitchen', secretSearchEligible: false, discovery: { kind: 'coins', dice: '1d6' } },
  ],
  [
    4,
    'Meeting area',
    { roomKind: 'table-and-chairs', secretSearchEligible: true, discovery: { kind: 'none' } },
  ],
  [
    5,
    'Scroll shelf',
    {
      roomKind: 'bookshelf',
      secretSearchEligible: false,
      discovery: { kind: 'magic-scrolls', dice: '1d6' },
    },
  ],
  [
    6,
    'Desk and chest',
    { roomKind: 'desk', secretSearchEligible: false, discovery: { kind: 'chest' } },
  ],
  [
    7,
    'Searchable debris',
    { roomKind: 'debris', secretSearchEligible: true, discovery: { kind: 'none' } },
  ],
  [
    8,
    'Sleeping quarters',
    { roomKind: 'bedroom', secretSearchEligible: false, discovery: { kind: 'chest' } },
  ],
  [
    9,
    'Overgrown chamber',
    { roomKind: 'garden', secretSearchEligible: true, discovery: { kind: 'none' } },
  ],
  [
    10,
    'Searchable storage',
    { roomKind: 'storage', secretSearchEligible: true, discovery: { kind: 'none' } },
  ],
  [
    11,
    'Map table',
    { roomKind: 'map-table', secretSearchEligible: true, discovery: { kind: 'none' } },
  ],
  [
    12,
    'Magic-item armoury',
    {
      roomKind: 'armoury',
      secretSearchEligible: false,
      discovery: { kind: 'magic-items', dice: '2d6' },
    },
  ],
] as const;

const roomContentTable: ExplorationTableDefinition = {
  id: 'palace.exploration.table.room-content.v1',
  label: 'Room content',
  dice: '2d6',
  inventoryId: 'INV-PAL-ROOM',
  sourcePage: 13,
  originCategory: null,
  rows: roomContentRows.map(([roll, label, outcome]) =>
    row(
      `palace.exploration.room-content.${roll}.v1`,
      range('2d6', `room-content-${roll}`, roll),
      label,
      outcome,
    ),
  ),
};

const monsterTable: ExplorationTableDefinition = {
  id: 'palace.exploration.table.monster.v1',
  label: 'Palace monster',
  dice: '2d6',
  inventoryId: 'INV-PAL-MON',
  sourcePage: 13,
  originCategory: null,
  rows: [
    row('palace.exploration.monster.2.v1', range('2d6', 'monster-2', 2), 'Minotaur', {
      monsterId: 'monster.minotaur',
      count: { kind: 'fixed', value: 1 },
      hitPoints: 14,
      damage: 7,
      traitIds: [],
    }),
    row('palace.exploration.monster.3.v1', range('2d6', 'monster-3', 3), 'Orc pair', {
      monsterId: 'monster.orc',
      count: { kind: 'fixed', value: 2 },
      hitPoints: 6,
      damage: 3,
      traitIds: ['trait.loot'],
    }),
    row('palace.exploration.monster.4.v1', range('2d6', 'monster-4', 4), 'Orc', {
      monsterId: 'monster.orc',
      count: { kind: 'fixed', value: 1 },
      hitPoints: 6,
      damage: 3,
      traitIds: ['trait.loot'],
    }),
    row('palace.exploration.monster.5.v1', range('2d6', 'monster-5', 5), 'Giant rats', {
      monsterId: 'monster.giant-rat',
      count: { kind: 'roll', dice: '1d6' },
      hitPoints: 2,
      damage: 1,
      traitIds: [],
    }),
    row('palace.exploration.monster.6.v1', range('2d6', 'monster-6', 6), 'Goblins', {
      monsterId: 'monster.goblin',
      count: { kind: 'roll', dice: '1d6' },
      hitPoints: 3,
      damage: 1,
      traitIds: ['trait.explosive'],
    }),
    row('palace.exploration.monster.7-8.v1', range('2d6', 'monster-7-8', 7, 8), 'Empty encounter', {
      monsterId: null,
      count: { kind: 'fixed', value: 0 },
      hitPoints: 0,
      damage: 0,
      traitIds: [],
    }),
    row('palace.exploration.monster.9.v1', range('2d6', 'monster-9', 9), 'Living armours', {
      monsterId: 'monster.living-armor',
      count: { kind: 'fixed', value: 2 },
      hitPoints: 8,
      damage: 3,
      traitIds: [],
    }),
    row('palace.exploration.monster.10.v1', range('2d6', 'monster-10', 10), 'Fungoids', {
      monsterId: 'monster.fungoid',
      count: { kind: 'fixed', value: 3 },
      hitPoints: 4,
      damage: 2,
      traitIds: ['trait.loot', 'trait.regeneration'],
    }),
    row('palace.exploration.monster.11.v1', range('2d6', 'monster-11', 11), 'Bone golem', {
      monsterId: 'monster.bone-golem',
      count: { kind: 'fixed', value: 1 },
      hitPoints: 12,
      damage: 5,
      traitIds: ['trait.undead'],
    }),
    row('palace.exploration.monster.12.v1', range('2d6', 'monster-12', 12), 'Walking slime', {
      monsterId: 'monster.walking-slime',
      count: { kind: 'fixed', value: 1 },
      hitPoints: 10,
      damage: 1,
      traitIds: ['trait.loot', 'trait.regeneration'],
    }),
  ],
};

export const authorizedPalaceExplorationPackage = {
  packageId: 'palace.exploration.authorized.v1',
  contentVersion: authorizedPalaceExplorationContentVersion,
  rulesVersion: authorizedPalaceExplorationRulesVersion,
  tables: [
    doorStateTable,
    staircaseSegmentTable,
    corridorSegmentTable,
    roomSegmentTable,
    secretPassageTable,
    trapTable,
    roomContentTable,
    monsterTable,
  ],
} as const;

export const authorizedPalaceExplorationContentHashes: Readonly<
  Record<PalaceContentId, `sha256:${string}`>
> = {
  'palace.exploration.package.v1':
    'sha256:77901163d335f6840e988b2d2450d013a59b957cbe6d0d5759e821e725558453',
  'palace.exploration.table.door-state.v1':
    'sha256:41dbc5713b58c8fe48e7cfdc0e91ed738126822c7a8c87e0cca1dddf678d1cfc',
  'palace.exploration.door-state.trapped.v1':
    'sha256:e65971c79c276b534aee97c84e4abdbaaeea31af1939c12c9d6eebb8423eb6ec',
  'palace.exploration.door-state.locked.v1':
    'sha256:f132a3d66a4302ee59b8cf2038f79c89c8e65d426fa42616973df810c2460604',
  'palace.exploration.door-state.unlocked.v1':
    'sha256:167c1269bbf0b1b31e337e0bd27300678beda3521baa314c4da8738c39a23ca2',
  'palace.exploration.table.segment-from-staircase.v1':
    'sha256:0cbb6643dbb09c1ccf02918ae7dc261cbd08f6e624556220d8345cd43620880b',
  'palace.exploration.segment-from-staircase.1.v1':
    'sha256:bbdd2979594036dd57ba44e47b079c986391cc32be2d14b79120c0cb7a9d857e',
  'palace.exploration.segment-from-staircase.2.v1':
    'sha256:60e80de56506cb195dd9808765c8eeb5d18fa17ee9442872d0335bbfed7d511c',
  'palace.exploration.segment-from-staircase.3.v1':
    'sha256:66b8bbf7dc96ee71bd9523917863793ea3aae6371a84135059b6543f18638e24',
  'palace.exploration.segment-from-staircase.4.v1':
    'sha256:39482fdff9218965df7344e9cdcec5a85a466cbc6e360d150d19f3832b7c1fe3',
  'palace.exploration.segment-from-staircase.5.v1':
    'sha256:3bf104a0c52035b75444848452f5acb30fa6dabe1c8a6d725acb64d3e2785302',
  'palace.exploration.segment-from-staircase.6.v1':
    'sha256:c42c8f609b4d4d9ff3314634bcb6768014002b8ee6352158170cacd355b8d14d',
  'palace.exploration.table.segment-from-corridor.v1':
    'sha256:360bda8ea9552603bf9800c4fd611f9889b84764715f0f243a0f80d5318ac9c1',
  'palace.exploration.segment-from-corridor.1.v1':
    'sha256:bf477b9b051db7be34e7197f93973549a36e90240ae0cec47352717a254782ff',
  'palace.exploration.segment-from-corridor.2.v1':
    'sha256:4ab6f0c763432490fff976c0579d139c39d7b216f9b8809023b7822425ff29eb',
  'palace.exploration.segment-from-corridor.3.v1':
    'sha256:c9f6182c862d142b5500e635f596950e1fc9cc3ef5fc71610a1a77c334053c68',
  'palace.exploration.segment-from-corridor.4.v1':
    'sha256:1e376641c72ea12d1c9543529decea60f33a901e86b1f9673ba5b96761041a90',
  'palace.exploration.segment-from-corridor.5.v1':
    'sha256:a06cc6f1e507babc90c5360bde1b0a432bb40ade64a17d091e860c198ddcd06e',
  'palace.exploration.segment-from-corridor.6.v1':
    'sha256:7ef635adaf63faed4d1d7452745b6f57358ccc4fc439f2285069982f3efb92bc',
  'palace.exploration.table.segment-from-room.v1':
    'sha256:e5cb2edb2e20ff31a09bca10a9a08902a028d77482bfce36788c86d1e6066002',
  'palace.exploration.segment-from-room.1.v1':
    'sha256:1883ddcc9c2bd0fd31974dd6a49634bc501ed20e2bd6748a1e8855b37dbd7b1b',
  'palace.exploration.segment-from-room.2.v1':
    'sha256:2718d763ceb67f39028ae17a77e2a24756e90c49e1a1ea209ec683d5c2649550',
  'palace.exploration.segment-from-room.3.v1':
    'sha256:4894adffeb60676d7d1524e8ca8c76a41b4c46c37f36540d91d033a983f7ef21',
  'palace.exploration.segment-from-room.4.v1':
    'sha256:092a42a42b44ab450ca26e1508b8d0bd0e2b7129c5cd0137ddcda7fb59e11774',
  'palace.exploration.segment-from-room.5.v1':
    'sha256:ded65452475e4cd2604e1383685da8834cfa37631d48b59657f8e31226d0fa68',
  'palace.exploration.segment-from-room.6.v1':
    'sha256:d11ce15050bbaf65100b7649228611924a3f8d19c2f13304d8d696aeb8e1adfa',
  'palace.exploration.table.secret-passage.v1':
    'sha256:050b22e87cdb6ef65f3c328347fb7a582bf7fbc6fd1065e0d461a12d67f8efee',
  'palace.exploration.secret-passage.trap.v1':
    'sha256:51946e4c43c89022174f04b932bd2798b33579b88fa6cf73533b67247250481b',
  'palace.exploration.secret-passage.none.v1':
    'sha256:cccca15a9851d31e6fa1596bfe6da63329d1038a5b76c5039fd74d5f60a517dd',
  'palace.exploration.secret-passage.chest.v1':
    'sha256:04bda67dfbdecd03e60937b2db3dca14152ed064e69dcae9a694a48fb54eee78',
  'palace.exploration.secret-passage.staircase.v1':
    'sha256:d12c5d549c22f19b20024cbd3f1dcb1b91679327a5b5a27498edbae2ea70e41d',
  'palace.exploration.table.trap.v1':
    'sha256:1ff19f85b30fe10c5f469a4ecc2aa020bbe6e97a49488a6e1de996147595da86',
  'palace.exploration.trap.blade.v1':
    'sha256:b7ee952088a2ec2483cb6a8c888e5b9eb7846ab86e38e52e59659e4567bb61f6',
  'palace.exploration.trap.acid.v1':
    'sha256:c40144b9646d4db7249624df0fe75de51f870839ce5d7e93ada5bacb1dda7f75',
  'palace.exploration.trap.pit.v1':
    'sha256:b80eebb45437698af83ad94edb47b9e54dd3e7f7fe294490e4d1d9f77ff92e4d',
  'palace.exploration.trap.dart.v1':
    'sha256:5caaa08b63bf2677ffc0a0a15966921582f312f4dce8aab9baf60897519d0ba3',
  'palace.exploration.trap.none.v1':
    'sha256:12ced7140f5a376b0597f3b511816c8a1e42232698509e10c17defcadb051ce4',
  'palace.exploration.table.room-content.v1':
    'sha256:85ce5005cfb8fd89e1aa46041355efd8b1d86d35b8c34d72913e2b8146ef1171',
  'palace.exploration.room-content.2.v1':
    'sha256:f0cb4aaf5b7d5e5ea8dc00ef56593283820a8f2594906fa9f3c1a9ff83f51433',
  'palace.exploration.room-content.3.v1':
    'sha256:abefc09120929b4f42539265a9efe7b30bca5dd7efefc83429798a2866d0307a',
  'palace.exploration.room-content.4.v1':
    'sha256:b360ebbfcb81ca237eda84d95b9a6a4887cb71adb029e6f274e5815296a65bdf',
  'palace.exploration.room-content.5.v1':
    'sha256:5872ec6ba2df1d845de4e86c9bb7c4bda37bf10f198946c9cec1f850f710e2a1',
  'palace.exploration.room-content.6.v1':
    'sha256:57521ed2e4bafb3610e961d910bbcd1c03d041a17f10435991aa132b2332e26f',
  'palace.exploration.room-content.7.v1':
    'sha256:a63fba1259b813521955367b03e11658f090673b42737d1664089ddb47ba20cf',
  'palace.exploration.room-content.8.v1':
    'sha256:e5d125159ab90e871eda54f368afb826546592f0eec573028ea87ce6c31e29fc',
  'palace.exploration.room-content.9.v1':
    'sha256:d75012c1989ea6916e92794e4cdcc56a3cbb21c5633456646b0f45fe583e44d2',
  'palace.exploration.room-content.10.v1':
    'sha256:d9b1f423291966f5903972304ccfc047874233033bf2ba526f5bd490a53623dc',
  'palace.exploration.room-content.11.v1':
    'sha256:a978a83a3af77b954c77af792599c5f76e5c72b75fb15512b644cf1f4505493a',
  'palace.exploration.room-content.12.v1':
    'sha256:a852e10f13089303333e7b9351883943b7330a4188e592f0b8b247ab1becceb5',
  'palace.exploration.table.monster.v1':
    'sha256:08e7849b01d74669cfc8f08f0b0b4480bfdffbd97b1f9607ea028f93ee06dc2e',
  'palace.exploration.monster.2.v1':
    'sha256:7cafef89f427971a8d82fc0ee71d0ccbdf3df9e31b8aa9456542e2265e6a0cad',
  'palace.exploration.monster.3.v1':
    'sha256:221df594f6152e98da74ac64b6378b1511d080dd06f51f77d7a1395560a70fc0',
  'palace.exploration.monster.4.v1':
    'sha256:d4c379bdc0240b8725ab2f99ac062b0894247ce9d41544fc8520b18446ee0e33',
  'palace.exploration.monster.5.v1':
    'sha256:7a71ba098cb7895b9164b5348e48d030f80fb614fab2bf3da5964adc9a487fee',
  'palace.exploration.monster.6.v1':
    'sha256:ba952748656a91598d0925824742a3345f8669253900af612157600fe5e2b823',
  'palace.exploration.monster.7-8.v1':
    'sha256:44279d35d1dbcb3665d9b10767b0beb69beb742ef562a54da2100ad9ea3d2ee2',
  'palace.exploration.monster.9.v1':
    'sha256:1602b3335ffccf97531f72ae2f89cfa72cc27df7cdbe13568a97f81f3abb78ce',
  'palace.exploration.monster.10.v1':
    'sha256:4657e6c849b6d92d48a7d1c378c1c5f30014b62f066d5bed6a3434357604701b',
  'palace.exploration.monster.11.v1':
    'sha256:5edf6c8da6f3edb67bf215ea04641b46c8789045088d0f5fa6f86a41bedc1780',
  'palace.exploration.monster.12.v1':
    'sha256:2d3b0c6dd8c0599068a6890e2e1717a28ed8f3539a8fa6ec73178397890a77f0',
};

const sourceReference = (
  inventoryId: string,
  sourcePage: 7 | 12 | 13,
): readonly PalaceSourceReference[] => [
  {
    kind: 'rulebook-table',
    sourceId: inventoryId,
    citationLabel: `Authorized structured Palace table ${inventoryId}`,
    locator: `NoteQuest first-author edition, page ${sourcePage}`,
    sourceVersion: '2020',
    notes: 'Structured values only; source prose, artwork, and layout are excluded.',
  },
  {
    kind: 'decision-register',
    sourceId: 'ISSUE-174',
    citationLabel: 'Authorized Palace exploration content package decision',
    locator: 'https://github.com/labax/NoteQuest/issues/174',
    sourceVersion: authorizedPalaceExplorationContentVersion,
  },
  {
    kind: 'controlled-evidence-record',
    sourceId: 'NOTEQUEST-ISSUE-80-TIAGO-JUNGES-PERMISSION-ATTESTATION',
    citationLabel: 'Project-owner permission attestation for NoteQuest content',
    locator: 'https://github.com/labax/NoteQuest/issues/80#issuecomment-5121522446',
    sourceVersion: '2026-07-29',
  },
];

const makeEntry = (
  table: ExplorationTableDefinition,
  definition: {
    id: PalaceContentId;
    label: string;
    kind: 'table' | 'table-row' | 'mechanic-reference';
    range?: PalaceRangeReference;
    structuredDefinition: Record<string, unknown>;
  },
): PalaceManifestEntry => ({
  id: definition.id,
  contentType:
    definition.kind === 'table' ? 'table' : definition.kind === 'table-row' ? 'row' : 'definition',
  kind: definition.kind,
  version: authorizedPalaceExplorationContentVersion,
  label: definition.label,
  ...(definition.kind === 'table-row' ? { parentId: table.id } : {}),
  ...(definition.range === undefined ? {} : { range: definition.range }),
  references:
    definition.kind === 'table'
      ? table.rows.map(({ id }) => id)
      : definition.id === 'palace.exploration.secret-passage.trap.v1'
        ? ['palace.exploration.table.trap.v1']
        : [],
  tags: ['palace', 'exploration', table.inventoryId.toLowerCase(), 'rights-safe'],
  structuredDefinition: definition.structuredDefinition,
  provenance: {
    origin: 'approved-source',
    sourceCategory: 'notequest_permissioned_tables',
    sourceName: 'Permitted NoteQuest Palace structured table data',
    sourceLocation: 'packages/content/src/authorized-palace-exploration.ts',
    sourceEditionVersion: '2020',
    sourceReferences: sourceReference(table.inventoryId, table.sourcePage),
    authorRightsHolder: 'Tiago Junges',
    permissionLicenseId: 'TIAGO-JUNGES-FULL-PERMISSION-OWNER-ATTESTATION-2026-07-29',
    rightsBasis:
      'The project owner attests that Tiago Junges granted full permission to use, adapt, and distribute NoteQuest content for this digital adaptation.',
    evidenceReference: {
      publicId: 'NOTEQUEST-ISSUE-80-TIAGO-JUNGES-PERMISSION-ATTESTATION',
      location: 'https://github.com/labax/NoteQuest/issues/80#issuecomment-5121522446',
      confidentiality: 'public-safe-reference',
    },
    permittedReleaseModes: [
      'internal-prototype',
      'closed-palace-playtest',
      'public-free-core-mvp',
      'future-commercial',
    ],
    restrictions: [
      'permission-attested-by-project-owner',
      'private-permission-evidence-not-published',
      'source-artwork-layout-and-trade-dress-excluded-from-this-package',
      'long-form-copied-source-prose-excluded-from-this-package',
    ],
    attributionRequired: true,
    attributionNoticeId: authorizedNoteQuestAttributionNotice.id,
    noticeLocations: [
      'about-credits',
      'notice-file',
      'content-manifest',
      'release-listing',
      'release-evidence-package',
    ],
    modifications: ['Stable IDs, structured effects, and concise non-expressive labels added.'],
    compatibilityPolicy: 'saved-history-pins-content-version',
    contentHash: {
      status: 'recorded',
      algorithm: 'SHA-256',
      canonicalization: 'RFC-8785',
      value:
        authorizedPalaceExplorationContentHashes[definition.id] ??
        'sha256:0000000000000000000000000000000000000000000000000000000000000000',
    },
    supersedes: [],
    confidentialRightsEvidence: 'excluded-from-public-manifest',
    containsExactSourceProse: false,
    containsSourceArtwork: false,
    containsTradeDress: false,
  },
  review: {
    approvalState: 'selected',
    reviewerRole: 'product',
    reviewerReference: 'ISSUE-174',
    reviewedAt: '2026-08-16T00:00:00.000Z',
    decisionReference: 'ISSUE-174-AUTHORIZED-PALACE-EXPLORATION',
    publicReleaseEligible: true,
  },
});

const packageEntryBase = makeEntry(doorStateTable, {
  id: 'palace.exploration.package.v1',
  label: 'Authorized Palace exploration package',
  kind: 'mechanic-reference',
  structuredDefinition: authorizedPalaceExplorationPackage,
});

const packageEntry: PalaceManifestEntry = {
  ...packageEntryBase,
  references: authorizedPalaceExplorationPackage.tables.map(({ id }) => id),
  tags: ['palace', 'exploration', 'authorized-package', 'rights-safe'],
  provenance: {
    ...packageEntryBase.provenance,
    sourceReferences: [
      ...[
        ['INV-NQ-013', 7],
        ['INV-PAL-SEG', 12],
        ['INV-PAL-SEC', 12],
        ['INV-PAL-TRAP', 12],
        ['INV-PAL-ROOM', 13],
        ['INV-PAL-MON', 13],
      ].map(([inventoryId, sourcePage]) => ({
        kind: 'rulebook-table' as const,
        sourceId: String(inventoryId),
        citationLabel: `Authorized structured Palace table ${inventoryId}`,
        locator: `NoteQuest first-author edition, page ${sourcePage}`,
        sourceVersion: '2020',
        notes: 'Structured values only; source prose, artwork, and layout are excluded.',
      })),
      {
        kind: 'decision-register',
        sourceId: 'ISSUE-174',
        citationLabel: 'Authorized Palace exploration content package decision',
        locator: 'https://github.com/labax/NoteQuest/issues/174',
        sourceVersion: authorizedPalaceExplorationContentVersion,
      },
      {
        kind: 'controlled-evidence-record',
        sourceId: 'NOTEQUEST-ISSUE-80-TIAGO-JUNGES-PERMISSION-ATTESTATION',
        citationLabel: 'Project-owner permission attestation for NoteQuest content',
        locator: 'https://github.com/labax/NoteQuest/issues/80#issuecomment-5121522446',
        sourceVersion: '2026-07-29',
      },
    ],
  },
};

export const authorizedPalaceExplorationManifest: PalaceContentManifest = {
  schemaVersion: 'palace-content-manifest.schema.v0.1',
  packageId: 'palace',
  contentVersion: authorizedPalaceExplorationContentVersion,
  rulesVersion: authorizedPalaceExplorationRulesVersion,
  generatedAt: '2026-08-16T00:00:00.000Z',
  entries: [
    packageEntry,
    ...authorizedPalaceExplorationPackage.tables.flatMap((table) => [
      makeEntry(table, {
        id: table.id,
        label: table.label,
        kind: 'table',
        structuredDefinition: {
          dice: table.dice,
          inventoryId: table.inventoryId,
          originCategory: table.originCategory,
        },
      }),
      ...table.rows.map((tableRow) =>
        makeEntry(table, {
          id: tableRow.id,
          label: tableRow.label,
          kind: 'table-row',
          range: tableRow.range,
          structuredDefinition: tableRow.outcome,
        }),
      ),
    ]),
  ],
};
