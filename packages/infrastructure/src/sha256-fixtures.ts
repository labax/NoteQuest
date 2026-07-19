export interface Sha256CanonicalJsonFixture {
  readonly name: string;
  readonly canonicalJson: string;
  readonly sha256: string;
  readonly checksum: `sha256:${string}`;
}

export const sha256CanonicalJsonFixtures = [
  {
    name: 'empty manifest object',
    canonicalJson: '{}',
    sha256: '44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a',
    checksum: 'sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a',
  },
  {
    name: 'ordered manifest-like object',
    canonicalJson:
      '{"content":{"a":"first","nested":{"alpha":1,"beta":2},"z":"last"},"id":"manifest.synthetic","version":1}',
    sha256: '32a8ed2a062750bf799efaeb769912c831690a5407a489321faed33f14d4abf4',
    checksum: 'sha256:32a8ed2a062750bf799efaeb769912c831690a5407a489321faed33f14d4abf4',
  },
  {
    name: 'snapshot array with nested objects',
    canonicalJson: '[{"a":1,"b":2},["x",{"c":[3,2,1],"d":null}]]',
    sha256: 'dedc7c95a449093f4e177743a0273d981531a82e5ec2bc86ee14f430bd0a1c61',
    checksum: 'sha256:dedc7c95a449093f4e177743a0273d981531a82e5ec2bc86ee14f430bd0a1c61',
  },
] as const satisfies readonly Sha256CanonicalJsonFixture[];
